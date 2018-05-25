function f(a, b, c, foo) {
  if (a < b)
    return a > 3 * foo.bar.alf && b < c.let
}

/** Test1 description */ 
export class Test1 {
  dance(){ ; ; ; return}
}
import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

function toEval() {

  const assert = require('assert')
  const fs = require('fs')

  // used functions as globals
  const getKindName = c.util.getKindName, ts = c.ts, positionOrRangeToNumber = c.util.positionOrRangeToNumber, print = c.print, findAscendant = c.util.findAscendant, filterChildren = c.util.filterChildren, getProgram = c.info.languageService.getProgram, getAscendants = c.util.getAscendants, findChildContainingPosition = c.util.findChildContainingPosition, findChild = c.util.findChild
  // node kind predicates and utilities:
  const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
  const isNotExpression = node => !isExpression(node)
  // const isStatement = node => getKindName(node).endsWith('Statement')
  // const isStatementContainer = n => getKindName(n).endsWith('Block') || n.kind === ts.SyntaxKind.SourceFile
  // const printNode = node => node ? (getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText().replace(/\s+/g, ' ').substring(0, Math.min(30, node.getText().length))+'...') : 'undefined'
  // const printNodes = nodes => nodes.map(printNode).join('\n')
  // const dumpNode = node => print(printNode(node))

  // code starts: 
  const program = getProgram()
  const sourceFile = program.getSourceFile(c.fileName)

  // position inside 'let' identifier and we found it using t.he "print ascendants of selected node" refactor utility. we hardcoded ere so we
  // can test faster but this is provided dynamically according to user current selection/cursor:
  c.positionOrRange = 81
  const position = positionOrRangeToNumber(c.positionOrRange) // 

  // this is the "let" token that appears as part of the expression 
  const node = findChildContainingPosition(sourceFile, position)

  // Then we want to locate the target expression that will be declared as variable. we can ask the user to choose one from allExpressions
  // (see next commented line) but here we  assume that the user wants to declare the toper one as variable (targetExpression):
  const targetExpression = findChild(findAscendant(node, isNotExpression), isExpression)
  // const allExpressions = filterChildren(firstNotExprAscendant, isExpression).filter(e => e !== node) 

  // we first find a node that can contain our variable declaration and its children statement right before which we will add our
  // declaration (the container is a Block so we are sure its children are wrapped has curly braces. Both are the next nodes:
  const statementContainer = findAscendant(targetExpression,  n => getKindName(n).endsWith('Block') || n.kind === ts.SyntaxKind.SourceFile)
  const declarationNextSibling = findChild(statementContainer, n=> getKindName(n).endsWith('Statement'))
  assert.ok(ts.isIfStatement(declarationNextSibling)) // this is the ascendant statement contained between curly braces not the return one

  // we are ready, we start manipulating the text string. The correct way of doing this is manipulating and printing the AST but I don't know 
  // how to do it with typescript natively. I do now how to do it with ts-simple-ast but wanted to maintain this example using pure typescript
  let newText = sourceFile.getFullText()
  newText = newText.substring(0, declarationNextSibling.getFullStart()) +  // to the begging of our future next sibling
    '\nconst renameIt = ' + targetExpression.getFullText() + ';' + // our expression variable declaration (dummy name 'renameIt')
    newText.substring(declarationNextSibling.getFullStart(), node.getFullStart()) + // removing "let"
    newText.substring(node.getEnd(), sourceFile.getEnd()) + // removing "let" and till the end of the file

  fs.writeFileSync(sourceFile.fileName, newText); // a file writing to itself, never seen before :P

  print(newText)
}





/***@ 

// use this code to get the user's selection position to hardcode in the code above, just select part of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram()
const position = c.util.positionOrRangeToNumber(c.positionOrRange)
c.print(position)

@***/
