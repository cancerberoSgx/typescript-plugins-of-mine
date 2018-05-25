function f(a, b, c, foo) {
  if (a < b)
    return a > 3 * foo.bar.alf && b < c.let;
}

// Heads up ! this version doesn't use ts-simple-ast and performs modifications by manipulating strings 
// which is not advisable. Check out the next version 06-postfix-transformer.ts for a better impl !!

import { EvalContext } from 'typescript-plugin-ast-inspector'
import { TLSSocket } from 'tls';
declare const c: EvalContext

function toEval() {

  const assert = require('assert') // require assert utility inside this function body so is available
  const fs = require('fs')

  // used functions as globals
  const getKindName = c.util.getKindName, ts = c.ts, print = c.print, findAscendant = c.util.findAscendant,
    getProgram = c.info.languageService.getProgram, findChild = c.util.findChild
  // node kind predicates and utilities:
  const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
  const isNotExpression = node => !isExpression(node)
  const isBlock = node => getKindName(node).endsWith('Block') || node.kind === ts.SyntaxKind.SourceFile
  const isStatement = node => getKindName(node).endsWith('Statement')

  // code starts: 
  const program = getProgram()
  const sourceFile = program.getSourceFile(c.fileName)

  // position inside 'let' identifier and we found it using t.he "print ascendants of selected node"
  // refactor utility. we hardcoded ere so we can test faster but this is provided dynamically
  // according to user current selection/cursor:
  c.positionOrRange = 81
  const position = c.util.positionOrRangeToNumber(c.positionOrRange)

  // this is the "let" token that appears as part of the expression 
  const postfixNode = c.util.findChildContainingPosition(sourceFile, position)

  // Then we want to locate the target expression that will be declared as variable. here we  assume 
  // that the user wants to declare the toper one as variable (targetExpression):
  const targetExpression = findChild(findAscendant(postfixNode, isNotExpression), isExpression)

  // we first find a node that can contain our variable declaration and its children statement right
  // before which we will add our declaration (the container is a Block so we are sure its children
  // are wrapped has curly braces. Both are the next nodes:
  const statementContainer = findAscendant(targetExpression, isBlock)
  const declarationNextSibling = findChild(statementContainer, isStatement)
  // assert that this is the ascendant statement contained between curly braces not the return one
  assert.ok(ts.isIfStatement(declarationNextSibling))
  // up to this point the code is the same as 05 - but now we wll generate the output using 
  // ts.Printer and ts.Transformation and will try to transform this sam e source file to see 
  // if it's woks OK in the context of a Language Service plugin

  const removePostfix = (context) => {
    return (rootNode) => {
      const visit = node => {
        node = ts.visitEachChild(node, visit, context)
        if (ts.isPropertyAccessExpression(node) && node.name === postfixNode) {
          return node.expression
        }
        return node
      }
      return ts.visitNode(rootNode, visit)
    }
  }
  const addVariableDeclaration = (context) => {
    return (rootNode) => {
      const visit = node => {
        node = ts.visitEachChild(node, visit, context)
        if (node === statementContainer) {
          const targetExpressionType = program.getTypeChecker().getTypeAtLocation(targetExpression)
          const typeNode = program.getTypeChecker().typeToTypeNode(targetExpressionType)
          const variableDeclaration = ts.createVariableDeclaration('nameMePlease', typeNode, c.util.asAny(targetExpression))
          const variableDeclarationList = ts.createVariableDeclarationList([variableDeclaration], ts.NodeFlags.Const)
          const newBlock = ts.updateBlock(node, [c.util.asAny(variableDeclarationList)].concat(node.statements))
          return newBlock
        }
        return node
      }
      return ts.visitNode(rootNode, visit)
    }
  }
  const replaceExpressionWithVariable = (context) => {
    return (rootNode) => {
      const visit = node => {
        node = ts.visitEachChild(node, visit, context)
        if (node === targetExpression) {
          return ts.createIdentifier('nameMePlease')
        }
        return node
      }
      return ts.visitNode(rootNode, visit)
    }
  }



  const printer = ts.createPrinter()
  // print(printer.printFile(sourceFile).substring(0, 133))
  const result = ts.transform(
    sourceFile, [addVariableDeclaration, replaceExpressionWithVariable,  removePostfix, ] // important ! the other order doesn't work - it seems that first must be the transformations that affects the AST leaves and then the transformations that affect nodes more close to the roots (close to the SourceFile at last. )
  )
  const transformedSourceFile = result.transformed[0]
  const output = printer.printFile(transformedSourceFile)
  print(output.substring(0, 150))

}

/***@ 

// use this code to get the user's selection position to hardcode in the code above, just select
part of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram() const position =
c.util.positionOrRangeToNumber(c.positionOrRange) c.print(position)

@***/