function f() {
  a > 3 && b < c.let
}

import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

function toEval() {
  const getKindName = c.util.getKindName, ts = c.ts
  const cursorPosition = 35
  const program = c.info.languageService.getProgram()
  const sourceFile = program.getSourceFile(c.fileName)
  const position = c.util.positionOrRangeToNumber(cursorPosition)
  const node = c.util.findChildContainingPosition(sourceFile, position - 1)// substract one so we are inside the postfix "if"
  printNode(node, 'node')
  const notExprAscendant = c.util.findAscendant(node, (a) => !isExpression(a))
  printNode(notExprAscendant, 'First non expression ascendant node')
  function isExpression(node) {
    return getKindName(node.kind).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || 
      getKindName(node.kind).endsWith('Token') || getKindName(node.kind).endsWith('Literal')
  }
  function printNode(node, label) {
    c.print(label + ' is ' + getKindName(node.kind) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth()+', '+node.getText())
  }
}
var __output = `
Output:
node is Identifier, starts: 32, width: 3, let
First non expression ascendant node is PropertyAccessExpression, starts: 29, width: 6, c.let

`
var __output = `
Output:
node is Identifier, starts: 32, width: 3, let
First non expression ascendant node is PropertyAccessExpression, starts: 29, width: 6, c.let

`
var __output = `
var __output 
var __output = `
Output:


`
var __output = `
Output:


`= `
Output:


`
Output:
node is Identifier, starts: 32, width: 3, let
First non expression ascendant node  is Identifier, starts: 32, width: 3, let

`   

/***@ 
@***/