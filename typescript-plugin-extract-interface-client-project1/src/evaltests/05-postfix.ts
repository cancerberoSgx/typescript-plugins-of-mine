// function f(a, b, c, foo) {
//   if (a < b)
//     return a > 3 * foo.bar.alf && b < c.let;
// }

// // Heads up ! this version doesn't use ts-simple-ast and performs modifications by manipulating strings 
// // which is not advisable. Check out the next version 06-postfix-transformer.ts for a better impl !!

// import { EvalContext } from 'typescript-plugin-ast-inspector'
// declare const c: EvalContext

// function toEval() {

//   // used functions as globals
//   const getKindName = c.util.getKindName, ts = c.ts, print = c.print, findAscendant = c.util.findAscendant,
//     getProgram = c.info.languageService.getProgram, findChild = c.util.findChild
//   // node kind predicates and utilities:
//   const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
//   const isNotExpression = node => !isExpression(node)
//   const isBlock = node => getKindName(node).endsWith('Block') || node.kind === ts.SyntaxKind.SourceFile
//   const isStatement = node => getKindName(node).endsWith('Statement')

//   // code starts: 
//   const program = getProgram()
//   const sourceFile = program.getSourceFile(c.fileName)

//   // position inside 'let' identifier and we found it using t.he "print ascendants of selected node"
//   // refactor utility. we hardcoded ere so we can test faster but this is provided dynamically
//   // according to user current selection/cursor:
//   c.positionOrRange = 82
//   const position = c.util.positionOrRangeToNumber(c.positionOrRange) // 

//   // this is the "let" token that appears as part of the expression 
//   const node = c.util.findChildContainingPosition(sourceFile, position)

//   // Then we want to locate the target expression that will be declared as variable. we can ask the
//   // user to choose one from allExpressions (see next commented line) but here we  assume that the
//   // user wants to declare the toper one as variable (targetExpression):
//   const targetExpression = findChild(findAscendant(node, isNotExpression), isExpression)
//   // const allExpressions = filterChildren(firstNotExprAscendant, isExpression).filter(e => e !==
//   // node) 

//   // we first find a node that can contain our variable declaration and its children statement right
//   // before which we will add our declaration (the container is a Block so we are sure its children
//   // are wrapped has curly braces. Both are the next nodes:
//   const statementContainer = findAscendant(targetExpression, isBlock)
//   const declarationNextSibling = findChild(statementContainer, isStatement)
//   // assert that this is the ascendant statement contained between curly braces not the return one
//   // assert.ok(ts.isIfStatement(declarationNextSibling)) 
//   // we are ready, we start manipulating the text string. The correct way of doing this is
//   // manipulating and printing the AST but I don't know how to do it with typescript natively. I do
//   // now how to do it with ts-simple-ast but wanted to maintain this example using pure typescript

//   // poor man indentation detector
//   const siblingIndentationMatch = /^(\s*)/m.exec(declarationNextSibling.getFullText())
//   const siblingIndentation = siblingIndentationMatch ? siblingIndentationMatch[1] : ''

//   let allText = sourceFile.getFullText()

//   // Let's remove ".let" from the target expression:
//   const targetExpressionTextWithoutNode =
//     allText.substring(targetExpression.pos, node.pos - 1) +  // -1 to remove the prefixed dot 
//     allText.substring(node.end, targetExpression.end)

//   const allNewText = allText.substring(0, declarationNextSibling.pos) +  
//     // the following lines add our dummy variable declaration instead of the targetlocation
//     siblingIndentation + 'const renameIt = ' + targetExpressionTextWithoutNode + ';' + 
//     allText.substring(declarationNextSibling.pos, targetExpression.pos) +  
//     ' renameIt ' +
//     allText.substring(targetExpression.end, sourceFile.end)  

//   print(allNewText.substring(0, 200))


// }
// `


// /***@ 

// // use this code to get the user's selection position to hardcode in the code above, just select
// part of "let" nad activate refactor "eval code in comments"

// const program = c.info.languageService.getProgram() 

// const position = c.util.positionOrRangeToNumber(c.positionOrRange) 

// c.print(position)

// @***/
