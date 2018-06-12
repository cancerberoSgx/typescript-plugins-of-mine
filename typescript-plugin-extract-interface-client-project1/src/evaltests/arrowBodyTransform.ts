
const o = {
  fn: (o1: string) => { return 'hello' + o1; },
  bodied: a => { return a - 1 + 2 / 6; },
  zeroArg: () => foo(),
  returningObjectLiteral: a => ({ a, b: 'hello world' })
}
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { findAscendant, getKindName } from 'typescript-ast-util';
declare const c: EvalContext;

function evaluateMe() {

  const arg = c, print = c.print, ts = c.ts, TypeGuards = c.tsa.TypeGuards
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())

  const simpleNode = sourceFile.getDescendantAtPos(27)
  const simpleArrow = simpleNode.getFirstAncestorByKind(ts.SyntaxKind.ArrowFunction)

  // print(simpleArrow.getParameters().map(p => p.getText()).join(',') + ': ' + (simpleArrow.getReturnTypeNode() && simpleArrow.getReturnTypeNode().getText()) + ' - ' + simpleArrow.getBody().getChildren().length + ' - expr: ' + simpleArrow.getEqualsGreaterThan().getNextSibling() && simpleArrow.getEqualsGreaterThan().getNextSibling().getKindName())

  const node = simpleNode.compilerNode

  const arrow = findAscendant<ts.ArrowFunction>(node, ts.isArrowFunction)
  if (arrow.body.getChildCount() > 2) {
    print('means it has a body {}')
    if (arrow.body.getChildren()[1].kind === ts.SyntaxKind.SyntaxList && arrow.body.getChildren()[1].getChildCount() > 1) {
      print('Means it has more than one statement - meaning braces cannot be removed')
    }
    else {
      print('braces with only one statement')
    }
  }
  else {
    print('means it doesnt have a body')
  }
  // print(getKindName(arrow.body.getChildren()[1]) + ' , ' + arrow.body.getText())

  sourceFile.deleteImmediatelySync()
}
