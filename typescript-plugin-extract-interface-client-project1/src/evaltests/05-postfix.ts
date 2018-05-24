function f(a, b, c, foo) {
  if(a<b)
    return a > 3 * foo.bar.alf && b < c.let
}

import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

function toEval() {
  // used functions as globals
  const getKindName = c.util.getKindName, ts = c.ts, positionOrRangeToNumber = c.util.positionOrRangeToNumber, print = c.print, findAscendant = c.util.findAscendant, filterChildren = c.util.filterChildren, getProgram = c.info.languageService.getProgram
  // node kind predicates and utilities:
  const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
  const isNotExpression = node=>!isExpression(node)
  const isStatement = node=>getKindName(node).endsWith('Statement')
  const isStatementContainer = n=>getKindName(n).endsWith('Block')||n.kind===ts.SyntaxKind.SourceFile
  function printNode(node, label = '') {
    print(label + ' is ' + getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText())
  }

  // code starts: 
  const program = getProgram()
  const sourceFile = program.getSourceFile(c.fileName)

  // position inside 'let' identifier and we found it using t.he "print ascendants of selected node" refactor utility. we hardcoded ere so we
  // can test faster but this is provided dynamically according to user current selection/cursor:
  const position = positionOrRangeToNumber(34)

  // this is the "let" token that appears as part of the expression
  const node = c.util.findChildContainingPosition(sourceFile, position)

  // we first find a node that can contain our variable declaration and its children statement right before which we will add our
  // declaration (the container is a Block so we are sure its children are wrapped has curly braces. Both are the next nodes:
  const parentStatementInBlock = findAscendant(node, isStatementContainer)
  const declarationNextSibling = parentStatementInBlock.getChildren().find(isStatement)
  
  // Then we want to locate the target expression that will be declared as variable. we can ask the user to choose one from allExpressions
  // (see next commented line) but here we  assume that the user wants to declare the toper one as variable (targetExpression):
  const targetExpression = findAscendant(node, isNotExpression) .getChildren().find(isExpression)
  // const allExpressions = filterChildren(firstNotExprAscendant, isExpression).filter(e => e !== node) 

  // we are ready, we start manipulating the text string. The correct way of doing this is manipulating and printing the AST but I don't know 
  // how to do it with typescript natively. I do now how to do it with ts-simple-ast but wanted to maintain this example using pure typescript
  let newText = sourceFile.getFullText()
  newText = newText.substring(0, declarationNextSibling.getFullStart()) +  // to the begging of our future next sibling
    '\nconst renameIt = ' + targetExpression.getText() + ';\n' + //our expression variable declaration (dummy name 'renameIt')
    ''

}
/***@ 
@***/`
AST of selected SourceFile:  
#0 SourceFile : "function f(a, b, c, foo) { if(a<b) return a > 3 * foo.bar.al"
#0 FunctionDeclaration : "function f(a, b, c, foo) { if(a<b) return a > 3 * foo.bar.al"
  #0 f Identifier : "f"
  #1 Parameter : "a"
    #0 a Identifier : "a"
  #2 Parameter : "b"
    #0 b Identifier : "b"
  #3 Parameter : "c"
    #0 c Identifier : "c"
  #4 Parameter : "foo"
    #0 foo Identifier : "foo"
  #5 Block : "{ if(a<b) return a > 3 * foo.bar.alf && b < c.let }"
    #0 IfStatement : "if(a<b) return a > 3 * foo.bar.alf && b < c.let"
      #0 BinaryExpression : "a<b"
        #0 a Identifier : "a"
        #1 LessThanToken : "<"
        #2 b Identifier : "b"
      #1 ReturnStatement : "return a > 3 * foo.bar.alf && b < c.let"
        #0 BinaryExpression : "a > 3 * foo.bar.alf && b < c.let"
          #0 BinaryExpression : "a > 3 * foo.bar.alf"
            #0 a Identifier : "a"
            #1 GreaterThanToken : ">"
            #2 BinaryExpression : "3 * foo.bar.alf"
              #0 NumericLiteral : "3"
              #1 AsteriskToken : "*"
              #2 PropertyAccessExpression : "foo.bar.alf"
                #0 PropertyAccessExpression : "foo.bar"
                  #0 foo Identifier : "foo"
                  #1 bar Identifier : "bar"
                #1 alf Identifier : "alf"
          #1 AmpersandAmpersandToken : "&&"
          #2 BinaryExpression : "b < c.let"
            #0 b Identifier : "b"
            #1 LessThanToken : "<"
            #2 PropertyAccessExpression : "c.let"
              #0 c Identifier : "c"
              #1 let Identifier : "let"
#1 EndOfFileToken : ""
`