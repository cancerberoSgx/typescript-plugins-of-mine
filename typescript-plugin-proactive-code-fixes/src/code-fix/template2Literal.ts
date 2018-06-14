import { BinaryExpression, Expression, NoSubstitutionTemplateLiteral, TemplateExpression, TypeChecker, TypeGuards, Node } from "ts-simple-ast";
import * as ts from 'typescript';
import { findAscendant } from "typescript-ast-util";
import { CodeFix, CodeFixOptions } from "../codeFixes";
import { changeQuoteChar, quote } from "../util";

/**

# Description

utilities related to strings: 

 * change string quote character
 * go from normal string concatenation to template strings and viceversa
 * 
 
# Example

# TODO

 * TODO: still missing the part that transform from string concat to string templates
 * TaggedTemplateExpression getExpression and remove tag - has some utilitiesfor working with rxjs - perhaps we want to include those here?
 * TODO: recurse on expressions that have templateExpressions descendants
 * allow me to convert string concat (a binaryoperationexpression into a single templateExpression 
 * console.log('a'+b+'c') -  change to template or viceversa works funny....
*/

export class Template2Literal implements CodeFix {

  name = 'template2Literal'

  config = {
    // TODO: so we also transform all expressions recursively from/to templateexpressions - stringliterals
    recurseOnTemplateExpressions: false,
    wrapStringConcatenationWithParenthesis: false
  }

  action: 'changeToLiteral' | 'changeToTemplate' | 'changeConcatenationToTemplate' | undefined;

  predicate(arg: CodeFixOptions): boolean {
    this.action = undefined
    const bin = <ts.BinaryExpression>findAscendant(arg.containingTargetLight, ts.isBinaryExpression, true)
    const binToken = bin && bin.operatorToken.getText()
    // heads up we can change just one literal to template or two operands in a binary expression '+' as long as one of them is a string
    if (ts.isStringLiteral(arg.containingTargetLight) && binToken !== '+') {
      // this.action = 'changeToTemplate'  // TODO: not implemented yet so we are not offering yet
    }
    else if (ts.isNoSubstitutionTemplateLiteral(arg.containingTargetLight) ||
      findAscendant<ts.TemplateExpression>(arg.containingTargetLight, ts.isTemplateExpression, true)) {
      this.action = 'changeToLiteral'
    }
    else if (binToken === '+') {
      const tc = arg.program.getTypeChecker()
      if (this.isString(bin.left, tc) || this.isString(bin.right, tc)) {
        this.action = 'changeConcatenationToTemplate'
      }
    }
    return !!this.action;
  }

  description(arg: CodeFixOptions): string {
    return this.action === 'changeToLiteral' ? `Change to string literal` : this.action === 'changeToTemplate' ? `Change string to template` : `Change concatenation to template`
  }

  apply(arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void {
    const node = arg.simpleNode
    if (this.action === 'changeToLiteral') {
      const templateExpr = TypeGuards.isNoSubstitutionTemplateLiteral(node) || TypeGuards.isTemplateExpression(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.TemplateExpression)

      if (templateExpr && TypeGuards.isTemplateExpression(templateExpr)) {
        this.templateExprToStringConcat(templateExpr, '"', arg.log)
      }
      else {
        arg.log('apply aborted - target node was not a string literal nor a stringtemplate expression or descendant. target node is ' + node.getText() + ' - kind: ' + node.getKindName())
      }
    }
    if (this.action === 'changeConcatenationToTemplate') {
      const tc = arg.simpleProject.getProgram().getTypeChecker()
      let innerStringConcatExpr = node.getAncestors()
        .find(a => TypeGuards.isBinaryExpression(a) && a.getOperatorToken().getText() === '+'
          && (this.isString2(a.getLeft(), tc) || this.isString2(a.getRight(), tc))
        ) as BinaryExpression

      // now we look the more leftest child to start with it
      let expr = innerStringConcatExpr
      while ((expr = expr.getLeft() as BinaryExpression) && TypeGuards.isBinaryExpression(expr)) {
        innerStringConcatExpr = expr
      }

      if (!innerStringConcatExpr) {
        arg.log('changeConcatenationToTemplate aborted - no outerStringConcatExpression found')
        return
      }
      this.stringConcatExpr2TemplateRecursively(innerStringConcatExpr, tc)
    }
    else {
      arg.log('action not implemented yet : ' + this.action)
    }
  }

  private templateExprToStringConcat(expr: TemplateExpression | NoSubstitutionTemplateLiteral, q: string, log: (msg) => void = () => { }) {
    let text: string
    if (TypeGuards.isNoSubstitutionTemplateLiteral(expr)) {
      changeQuoteChar(expr, '\'') //TODO: default quotes in case of NoSubstitutionTemplateLiteral ? 
      return
    }
    const arr = []
    let textToPush = expr.getHead().getLiteralText()
    if (textToPush) {
      arr.push(quote(textToPush, q))
    }
    expr.getTemplateSpans().forEach(span => {
      // TODO: recurse on expressions that have templateExpressions
      // heads up : Only wrap in paren if there is more than one descentant expression
      const expr = span.getExpression()
      const wrapInParen = TypeGuards.isConditionalExpression(expr) ||
        (TypeGuards.isBinaryExpression(expr) && expr.getOperatorToken().getText() === '+' && (TypeGuards.isBinaryExpression(expr.getParent()) || expr.getFirstDescendantByKind(ts.SyntaxKind.BinaryExpression))) ||
        TypeGuards.isBinaryExpression(expr) && expr.getOperatorToken().getText() !== '+'  // TODO: probably there are other cases missing here. 

      arr.push((wrapInParen ? '(' : '') + expr.getText() + (wrapInParen ? ')' : ''))
      textToPush = span.getLiteral().getLiteralText()
      if (textToPush) {
        arr.push(quote(textToPush, q))
      }
    })
    text = (this.config.wrapStringConcatenationWithParenthesis ? '( ' : '') + arr.join(' + ') + (this.config.wrapStringConcatenationWithParenthesis ? ' )' : '')
    log('replacing with text : ' + text);
    expr.replaceWithText(text)
  }

  private exprBuffer = []
  private stringConcatExpr2TemplateRecursively(exprBase: BinaryExpression, tc: TypeChecker) {
    this.exprBuffer = []
    let expr: Node = exprBase
    this.stringConcatExpr2Template(exprBase, tc, true)
    while ((expr = expr.getParent()) && TypeGuards.isBinaryExpression(expr)) {
      this.stringConcatExpr2Template(expr, tc)
    }
    const text = `\`${this.exprBuffer.join('')}\``
    expr.getFirstChildByKind(ts.SyntaxKind.BinaryExpression)!.replaceWithText(text)
  }

  private stringConcatExpr2Template(expr: BinaryExpression, tc: TypeChecker, firstTime: boolean = false) {
    let leftText: string = this.expression2String(expr.getLeft())
    let rightText: string = this.expression2String(expr.getRight())
    if (firstTime && leftText) {
      this.exprBuffer.push(leftText)
    }
    if (rightText) {
      this.exprBuffer.push(rightText)
    }
  }

  private expression2String(expr: Expression): string {
    if (TypeGuards.isParenthesizedExpression(expr)) {
      expr = expr.getExpression()
    }
    if (TypeGuards.isStringLiteral(expr)) {
      return expr.getLiteralText()
    }
    else {
      return '${' + expr.getText() + '}'
    }
  }

  private isString(expr: ts.Expression, tc: ts.TypeChecker): boolean {
    const t = tc.getTypeAtLocation(expr)
    return t.isStringLiteral() ? true : t.getSymbol() ? !!t.getSymbol().getDeclarations().find(d => tc.getTypeAtLocation(d).isStringLiteral()) : false
  }

  private isString2(expr: Expression, tc: TypeChecker): boolean {
    const t = tc.getTypeAtLocation(expr)
    return t.isStringLiteral() ? true : t.getSymbol() ? !!t.getSymbol().getDeclarations().find(d => tc.getTypeAtLocation(d).isStringLiteral()) : false
  }
}

export const template2Literal = new Template2Literal()


