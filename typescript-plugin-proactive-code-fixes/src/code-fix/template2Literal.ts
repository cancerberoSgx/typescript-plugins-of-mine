import { BinaryExpression, Expression, NoSubstitutionTemplateLiteral, TemplateExpression, TypeChecker, TypeGuards } from "ts-simple-ast";
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
 * config
*/

export class Template2Literal implements CodeFix {

  name = 'template2Literal'

  config = {
    // TODO: so we also transform all expressions recursively from/to templateexpressions - stringliterals
    recurseOnTemplateExpressions: false,
    wrapStringConcatenationWithParenthesis: false
  }

  action: 'changeToLiteral' | 'changeToTemplate' | 'changeConcatenationToTemplate' | undefined;
  // expr: ts.TemplateExpression;

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
        this.action = 'changeConcatenationToTemplate' // TODO: not implemented yet so we are not offering yet
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
      const outerStringConcatExpression = node.getAncestors()
        .find(a => TypeGuards.isBinaryExpression(a) && a.getOperatorToken().getText() === '+' && (this.isString2(a.getLeft(), tc) || this.isString2(a.getRight(), tc))) as BinaryExpression
      // .reverse()
      // .find(a => TypeGuards.isBinaryExpression(a) && (isString2(a.getLeft(), tc) || isString2(a.getRight(), tc))) as BinaryExpression
      if (!outerStringConcatExpression) {
        arg.log('changeConcatenationToTemplate aborted - no outerStringConcatExpression found')
        return
      }
      this.stringConcatExpr2Template(outerStringConcatExpression, tc)
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
    arr.push(quote(expr.getHead().getLiteralText(), q))
    expr.getTemplateSpans().forEach(span => {
      // TODO: recurse on expressions that have templateExpressions
      // TODO: only wrap in paren if there is more than one descentant expression
      arr.push('(' + span.getExpression().getText() + ')')
      arr.push(quote(span.getLiteral().getLiteralText(), q))
    })
    text = (this.config.wrapStringConcatenationWithParenthesis ? '( ' : '') + arr.join(' + ') + (this.config.wrapStringConcatenationWithParenthesis ? ' )' : '')
    log('replacing with text : ' + text)

    expr.replaceWithText(text)
  }

  private isString(expr: ts.Expression, tc: ts.TypeChecker): boolean {
    const t = tc.getTypeAtLocation(expr)
    return t.isStringLiteral() ? true : t.getSymbol() ? !!t.getSymbol().getDeclarations().find(d => tc.getTypeAtLocation(d).isStringLiteral()) : false
  }
  private isString2(expr: Expression, tc: TypeChecker): boolean {
    const t = tc.getTypeAtLocation(expr)
    return t.isStringLiteral() ? true : t.getSymbol() ? !!t.getSymbol().getDeclarations().find(d => tc.getTypeAtLocation(d).isStringLiteral()) : false
  }

  private stringConcatExpr2Template(expr: BinaryExpression, tc: TypeChecker) {
    //TODO: this shall be recursive - from bottom to top
    const left = expr.getLeft()
    const right = expr.getRight()
    let leftText: string = expr.getLeft().getText(), rightText: string = expr.getRight().getText()
    if (TypeGuards.isStringLiteral(left)) {
      leftText = left.getLiteralText()
    }
    else {
      leftText = '${leftText}'
    }
    if (TypeGuards.isStringLiteral(right)) {
      rightText = right.getLiteralText()
    }
    else {
      rightText = '${rightText}'
    }
    expr.replaceWithText(`\`${leftText}${rightText}\``)
  }
}

export const template2Literal = new Template2Literal()


