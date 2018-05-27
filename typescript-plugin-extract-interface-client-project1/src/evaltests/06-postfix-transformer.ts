function f(a, b, c, foo) {
  if (a < b)
    return a > 3 * foo.bar.alf && b < c.let
}

/***@

// use this code to get the user's selection position to hardcode in the code above, just
// select part of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram()
const position = c.util.positionOrRangeToNumber(c.positionOrRange) c.print(position)

@***/

// Heads up ! in this version we use typescript transformations and printers to modify the source file
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
function letPostfix() {
  const assert = require('assert'); // require assert utility inside this function body so is available
  const fs = require('fs');
  // used functions as globals
  const getKindName = c.util.getKindName, ts = c.ts, print = c.print, findAscendant = c.util.findAscendant, getProgram = c.info.languageService.getProgram, findChild = c.util.findChild, printNode = c.util.printNode
  // node kind predicates and utilities:
  const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier ||
    getKindName(node).endsWith('Literal');
  const isNotExpression = node => !isExpression(node);
  const isBlock = node => getKindName(node).endsWith('Block') || node.kind === ts.SyntaxKind.SourceFile;
  const isStatement = node => getKindName(node).endsWith('Statement');

  // code starts: 
  const program = getProgram();
  const sourceFile = program.getSourceFile(c.fileName);
  // position inside 'let' identifier and we found it using t.he "print ascendants of selected node"
  // refactor utility. we hardcoded ere so we can test faster but this is provided dynamically
  // according to user current selection/cursor:
  c.positionOrRange = 80;
  const position = c.util.positionOrRangeToNumber(c.positionOrRange);
  // this is the "let" token that appears as part of the expression "expr.let"
  const postfixNode = c.util.findChildContainingPosition(sourceFile, position);
  // Then we want to locate the target expression that will be declared as variable. here we  assume 
  // that the user wants to declare the toper one as variable (targetExpression):
  const targetExpression = findChild(findAscendant(postfixNode, isNotExpression), isExpression);
  // return print('postfixNode - ' + printNode(targetExpression)+ printNode(postfixNode))


  // we first find a node that can contain our variable declaration and its children statement right
  // before which we will add our declaration (the container is a Block so we are sure its children
  // are wrapped has curly braces. Both are the next nodes:
  const statementContainer = findAscendant(targetExpression, isBlock);
  const declarationNextSibling = findChild(statementContainer, isStatement);
  // print('declarationNextSibling ++' + printNode(declarationNextSibling))
  // assert that this is the ascendant statement contained between curly braces not the return one
  // assert.ok(ts.isIfStatement(declarationNextSibling));
  // up to this point the code is the same as 05 - but now we wll generate the output using 
  // ts.Printer and ts.Transformation and will try to transform this sam e source file to see 
  // if it's woks OK in the context of a Language Service plugin. There will be three transformations
  // this transformation will remove the postfix ".let" from the expression
  const removePostfix = (context) => {
    return (rootNode) => {
      const visit = node => {
        node = ts.visitEachChild(node, visit, context);
        if (node.name === postfixNode) {
          return node.expression; // instead of the expression `expr.let` we return just `expr`
        }
        return node;
      };
      return ts.visitNode(rootNode, visit);
    };
  };
  // this transformation will add the variable declaration as the first child of the black
  const addVariableDeclaration = (context) => {
    return (rootNode) => {
      const visit = node => {
        node = ts.visitEachChild(node, visit, context);
        if (node === statementContainer) {
          const targetExpressionType = program.getTypeChecker().getTypeAtLocation(targetExpression);
          const typeNode = program.getTypeChecker().typeToTypeNode(targetExpressionType);
          // Heads up ! we need to create a copy of target extension using `ts.getMutableClone`. If we dont do
          // that, `replaceExpressionWithVariable` transformation will replace also this expression with the
          // variable name but we only want to replace the original targetExpression 
          const targetExpressionClone = ts.getMutableClone(targetExpression);
          const variableDeclaration = ts.createVariableDeclaration('nameMePlease', typeNode, c.util.asAny(targetExpressionClone));
          const variableDeclarationList = ts.createVariableDeclarationList([variableDeclaration], ts.NodeFlags.Const);
          return ts.updateBlock(node, [c.util.asAny(variableDeclarationList)].concat(node.statements));
        }
        return node;
      };
      return ts.visitNode(rootNode, visit);
    };
  };
  // this transformation will replace the original expression with the new variable name added by  addVariableDeclaration
  const replaceExpressionWithVariable = (context) => {
    return (rootNode) => {
      const visit = node => {
        node = ts.visitEachChild(node, visit, context);
        if (node === targetExpression) {
          return ts.createIdentifier('nameMePlease');
        }
        return node;
      };
      return ts.visitNode(rootNode, visit);
    };
  };
  // HEADS UP! the order is important! transformations will be applied serially and affect each other. 
  // In general the less destructive / top level first
  const transformations = [addVariableDeclaration, replaceExpressionWithVariable, removePostfix,];
  const result = ts.transform(sourceFile, transformations);
  const printer = ts.createPrinter();
  const transformedSourceFile = result.transformed[0];
  const output = printer.printFile(transformedSourceFile);
  print(output.substring(0, 150));
}