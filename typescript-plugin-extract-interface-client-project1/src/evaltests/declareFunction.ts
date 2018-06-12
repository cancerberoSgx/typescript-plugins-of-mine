
const arg1 = {a: 'i'}; 
const a: boolean = nonExistentFunction<string>(1, arg1)  

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
  const code = `const arg1 = {a: 'i'}; 
  const a: boolean = nonExistentFunction<string>(1, arg1)  
  `
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', code )

  const id = sourceFile.getDescendantAtPos(55);
  const parent = id.getParent()
  if(!TypeGuards.isIdentifier(id) || !TypeGuards.isCallExpression(parent)){
    print('predicate false : !TypeGuards.isIdentifier(id) || !TypeGuards.isCallExpression(parent)')
    return
  }
  const expression = parent.getExpression()
  if(!TypeGuards.isIdentifier(expression)){
    print('predicate false :!TypeGuards.isIdentifier(expression)')
    return
  }
  const container = parent.getFirstAncestorByKind(ts.SyntaxKind.Block) || sourceFile
  const statementAncestor = parent.getAncestors().find(a=>a.getParent() === container)//TypeGuards.isStatement)
  if(!statementAncestor || !container){
    print('!statementAncestor || !container')
    return
  }
  
  container.insertStatements(statementAncestor.getChildIndex(), `function ${id.getText()}(${parent.getArguments().map((a, index) => 'arg'+index+': '+a.getType().getText()).join(', ')}){
  throw new Error('Not Implemented');
}`)

  print(parent.getArguments().map(a=>a.getText()).join(', '))

  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}
var __output = `
Output:
1, arg1
const arg1 = {a: 'i'};
function nonExistentFunction(arg0: 1, arg1: { a: string; }){
  throw new Error('Not Implemented');
} 
  const a: boolean = nonExistentFunction<string>(1, arg1)  
  

`