
import * as ts from 'typescript'
import { ClassDeclaration, InterfaceDeclaration, TypeGuards, ExpressionWithTypeArguments, ParameterDeclaration, ParameterDeclarationStructure, Type, MethodSignature, FunctionLikeDeclaration } from 'ts-simple-ast'
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { ok } from 'assert';
declare const c: EvalContext;


let print
/**
 
# Description

This is the opposite as fixImplementation* - when the implementation implements an interface or class incorrectly it ill fix the interface/class instead of the implementation by adding/removing

WARNING: this is probably very dangerous operation but could be useful on initial quick type modeling from data

# Example: 
```
interface Actor {
  act(other: Actor): Array<Date>
  talk(script:string): number|boolean
}
const actor1: Actor= {
  act(what, when){return [what.getTime()]}
}
```
# Attacks: 
"code": "2416","message": "Property 'method1' in type 'SomeImplementation' is not assignable to the same property in base type 'SomeInterface'.\n  Type '(param: number) => number[]' is not assignable to type '(param: string) => number[]'.\n    Types of parameters 'param' and 'param' are incompatible.\n      Type 'string' is not assignable to type 'number'.",
*/

interface Actor {
  act(other: Actor): Array<Date>
  talk(script:string): number|boolean
}
const actor1: Actor= {
  act(what, when){return [what.getTime()]}
}



function evaluateMe() {
  print = c.print
  // clone source file so this one is not modified
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())

  //TODO
  const id = sourceFile.getDescendantAtPos(1365)
  print(id.getKindName())
  sourceFile.deleteImmediatelySync()
}
