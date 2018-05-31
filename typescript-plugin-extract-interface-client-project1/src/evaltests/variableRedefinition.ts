import * as ts from 'typescript'
import { ClassDeclaration, InterfaceDeclaration, TypeGuards, ExpressionWithTypeArguments, ParameterDeclaration, ParameterDeclarationStructure, Type, MethodSignature, FunctionLikeDeclaration } from 'ts-simple-ast'
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { dumpAst } from 'typescript-ast-util'
import { ok } from 'assert';
declare const c: EvalContext;


let print
/**
 
# Description

This is the opposite as fixImplementation* - when the implementation implements an interface or class incorrectly it ill fix the interface/class instead of the implementation by adding/removing

WARNING: this is probably very dangerous operation but could be useful on initial quick type modeling from data

# Example: 
```
let a = 1
//....
let a = 's'
// ....
function a(){}
class a{}
```
# Attacks: 

"message": "Cannot redeclare block-scoped variable 'a'.",
*/

let a = 1
//....
let a = 's'
// ....
// function a(){}
// class a{}

function evaluateMe() {
  print = c.print
  // clone source file so this one is not modified
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
  const id = sourceFile.getDescendantAtPos(936)
  if (!TypeGuards.isIdentifier(id)) {
    return // TODO: log
  }
  id.rename(id.getText() + '2')
  print(id.getAncestors().map(a => a.getKindName()).join(','))
  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}
