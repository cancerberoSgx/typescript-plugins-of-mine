const s = 'he"llo" `pwd` from don\'t'
const s2 = 'hello `pwd`  string'
const s3 = "no replaces here"
const name = 'seba'
const t1 = `hello ${name} we are "glad" ${'you'} have ${1 + 2 + 3} years old`

const concat1 = 's' + "hello" + `no replaces here` + `replaces ${name}`;
const concat2 = 'hello ' + 1
const concat3 = 'hello ' + name


import { NoSubstitutionTemplateLiteral, StringLiteral, TemplateExpression, TypeGuards, DefinitionInfo } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { findAscendant } from 'typescript-ast-util';
declare const c: EvalContext;
let print


function evaluateMe() {
  print = c.print
  const args = c
  const changeTo = '"'
  const position = 294
  const sourceFile = c.project.createSourceFile(`tmp/extractInterfaceNewOne${Date.now()}.ts`, c.node.getSourceFile().getText())
  let node = sourceFile.getDescendantAtPos(position)

  const target = node.compilerNode
  const bin = <ts.BinaryExpression>findAscendant(target, ts.isBinaryExpression, true)


  const tc = args.info.languageService.getProgram().getTypeChecker()

  print(bin.getText() + ', left: ' + bin.left.getText() + ', right: ' + bin.right.getText() + ' op: ' + bin.operatorToken.getText() + ' leftisstring: ' + isString(bin.left, tc) + ' right isstring: ' + isString(bin.right, tc))
  return
  // const t = tc.getTypeAtLocation(bin.left).isStringLiteral

  function isString(expr: ts.Expression, tc: ts.TypeChecker): boolean {
    const t = tc.getTypeAtLocation(expr)
    return t.isStringLiteral() ? true : t.getSymbol() ? !!t.getSymbol().getDeclarations().find(d => tc.getTypeAtLocation(d).isStringLiteral()) : false
  }
  // args.info.languageService.getTypeDefinitionAtPosition(bin.left)

  // .getTypeChecker().getTypeAtLocation(bin.left).getText() + 
  // 's' + "hello"left: 's', right: "hello" op: +

  function changeQuoteChar(node: StringLiteral | NoSubstitutionTemplateLiteral, newQuoteChar: string) {
    const newText = quote(node.getLiteralText(), newQuoteChar)
    node.replaceWithText(newText)
  }
  function quote(s, q) {
    const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
    return q + newLiteral + q
  }
  function templateExprToStringConcat(expr: TemplateExpression | NoSubstitutionTemplateLiteral, q: string, log: (msg) => void = () => { }) {
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
    log('replacing with text : ' + text)

    expr.replaceWithText(text)
  }


  if (TypeGuards.isStringLiteral(node) || TypeGuards.isNoSubstitutionTemplateLiteral(node)) {
    // print('sebaa' + node.compilerNode.getText())
    changeQuoteChar(node, changeTo)
    return
  }
  const templateExpr = TypeGuards.isTemplateExpression(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.TemplateExpression)

  if (templateExpr && TypeGuards.isTemplateExpression(templateExpr)) {
    templateExprToStringConcat(templateExpr, '"')
  }
  else {
    args.log('apply aborted - target node was not a string literal nor a stringtemplate expression or descendant. target node is ' + node.getText() + ' - kind: ' + node.getKindName())
  }

  print(sourceFile.getText().substring(0, Math.min(sourceFile.getText().length, 300)))
  sourceFile.deleteImmediatelySync()
}
