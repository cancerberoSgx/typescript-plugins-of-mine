import { now } from "hrtime-now";
import { ClassDeclaration, InterfaceDeclaration, MethodDeclarationStructure, MethodSignatureStructure, PropertyDeclaration, PropertySignature, Scope, TypeGuards, StringLiteral, NoSubstitutionTemplateLiteral, TemplateExpression } from "ts-simple-ast";
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

  action: 'changeToLiteral' | 'changeToTemplate' | undefined;
  expr: ts.TemplateExpression;

  predicate(arg: CodeFixOptions): boolean {
    this.action = undefined
    if (ts.isStringLiteral(arg.containingTargetLight)) {
      this.action = 'changeToTemplate'
    }
    else if (ts.isNoSubstitutionTemplateLiteral(arg.containingTargetLight) || ts.isTemplateExpression(arg.containingTargetLight) || (this.expr = findAscendant<ts.TemplateExpression>(arg.containingTargetLight, ts.isTemplateExpression, true))) {
      this.action = 'changeToLiteral'
    }
    return !!this.action;
  }

  description(arg: CodeFixOptions): string {
    return this.action === 'changeToLiteral' ? `Change to string literal` : `Change to template`
  }

  apply(arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void {
    const node = arg.simpleNode
    // const changeTo = '"'
    const templateExpr = TypeGuards.isNoSubstitutionTemplateLiteral(node) || TypeGuards.isTemplateExpression(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.TemplateExpression)

    if (templateExpr && TypeGuards.isTemplateExpression(templateExpr)) {
      this.templateExprToStringConcat(templateExpr, '"', arg)
    }
    else {
      arg.log('apply aborted - target node was not a string literal nor a stringtemplate expression or descendant. target node is ' + node.getText() + ' - kind: ' + node.getKindName())
    }
  }

  private templateExprToStringConcat(expr: TemplateExpression | NoSubstitutionTemplateLiteral, q: string, arg: CodeFixOptions) {
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

    // text = `( ${arr.join(' + ')} )`
    arg.log('replacing with text : ' + text)

    expr.replaceWithText(text)
  }

}

export const template2Literal = new Template2Literal()
