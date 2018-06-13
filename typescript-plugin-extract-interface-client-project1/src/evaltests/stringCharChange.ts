const s = 'he"llo" `pwd` from don\'t'
const s2 = 'hello `pwd`  string'
const s3 = "no replaces here"
const tpl = "hello " + 'seba' + " tomorrow " + new Date().toString() + " will be " + `another ${'day'}` + " ..."
const tpl2 = ("hello " + 'seba' + " tomorrow " + new Date().toString() + " will be " + `another ${'day'}` + " ...")


import { NoSubstitutionTemplateLiteral, StringLiteral, TemplateExpression, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
let print


function evaluateMe() {
  print = c.print
  const args = c
  const changeTo = '"'
  const position = 14
  const sourceFile = c.project.createSourceFile(`tmp/extractInterfaceNewOne${Date.now()}.ts`, c.node.getSourceFile().getText())
  let node = sourceFile.getDescendantAtPos(position)


  function changeQuoteChar(node: StringLiteral | NoSubstitutionTemplateLiteral, newQuoteChar: string) {
    const newLiteral = node.getLiteralText().replace(new RegExp(`${newQuoteChar}`, 'gmi'), `\\${newQuoteChar}`)
    const newText = `${newQuoteChar}${newLiteral}${newQuoteChar}`
    node.replaceWithText(newText)
  }
  function quote(s, q) {
    return q + s + q
  }
  function templateExprToStringConcat(expr: TemplateExpression, q: string) {
    const arr = []
    arr.push(quote(expr.getHead().getLiteralText(), q))
    expr.getTemplateSpans().forEach(span => {
      arr.push(span.getExpression().getText()) // TODO: recurse on expressions that have templateExpressions
      arr.push(quote(span.getLiteral().getLiteralText(), q))
    })
    const text = '( ' + arr.join(' + ') + ' )'
    expr.replaceWithText(text)
  }


  if (TypeGuards.isStringLiteral(node) || TypeGuards.isNoSubstitutionTemplateLiteral(node)) {
    print('sebaa' + node.compilerNode.getText())
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
