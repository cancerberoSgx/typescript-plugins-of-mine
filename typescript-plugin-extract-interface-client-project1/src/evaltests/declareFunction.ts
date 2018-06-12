
/**
 
# Description
# Attacks

# Example
*/
import { TypeGuards, VariableStatementStructure, FunctionTypeNode, InterfaceDeclarationStructure, ParameterDeclarationStructure } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
let print

function evaluateMe() {
  print = c.print
  c.log = c.print
  // clone source file so this one is not modified
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())

  const id = sourceFile.getDescendantAtPos(911);
  const parent = id.getParent()
  if(!TypeGuards.isIdentifier(id) || !TypeGuards.isCallExpression(parent)){
    return//TODO: log
  }
  
  print(parent.getExpression().getText())

  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}