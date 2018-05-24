function f(a, b, c, foo) {
  a > 3 * foo.bar.alf && b < c.let
}

import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

function toEval() {
  // useful functions as globals
  const getKindName = c.util.getKindName, ts = c.ts, positionOrRangeToNumber = c.util.positionOrRangeToNumber, print = c.print
  // utility functions
  function isExpression(node) {
    return getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
  }
  function printNode(node, label = '') {
    print(label + ' is ' + getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText())
  }
  const cursorPosition = 34 // position inside 'let' identifier and we found it using t.he "print ascendants of selected node" refactor utility
  const program = c.info.languageService.getProgram()
  const sourceFile = program.getSourceFile(c.fileName)
  const position = c.util.positionOrRangeToNumber(cursorPosition)
  const node = c.util.findChildContainingPosition(sourceFile, position) // this is "let" identifier
  // printNode(node, 'node')
  const firstNotExprAscendant = c.util.findAscendant(node, (a) => !isExpression(a)) // this is ExpressionStatement 33, a > 3*foo.bar.alf && b < c.let
  // printNode(firstNotExprAscendant, 'First non expression ascendant ')
  const allExpressions = c.util.filterChildren(firstNotExprAscendant, isExpression).filter(e => e !== node) // these are all expressions but "let" - we must ask the user which is the one to declare as variable
  // c.print(allExpressions.map(n=>n.getText()).join(', '))

  // we assume user wants to declare the toper one as variable
  const targetExpression = firstNotExprAscendant.getChildren().find(isExpression)
  // printNode(targetExpression)

  //now we need to find the target expression ascendance that able to contain the  variable declaration
  //statement ( let aVariable = $targetExpression )
  // let newText = sourceFile.getFullText()
  // newText = newText.substring(0, targetExpression.getFullStart()) + 

}
var __output = `
Output:
 is BinaryExpression, starts: 26, width: 35, a > 3 * foo.bar.alf && b < c.let

`
/***@ 
@***/