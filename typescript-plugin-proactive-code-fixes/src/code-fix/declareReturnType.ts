/*
buggy : TODOS and errors - things that works and things that doesn't work yet
function g(): GResult {	// THIS works
  return { a: 1, b: 's' }
}
const g2 = (): GResult2 => ({ a: 1, b: 's' })// TODO: doesn't work
const g3 = (): GResult3 => { return { a: 1, b: 's' } } // TODO: doesn't work
const h2 = (): HResult2 => ({ // TODO this doesn't work - error!
  a: 1, b: 's', log: (msg) => true, kill: function () { return 1 }
})
const h3 = (): HelloType => {  // TODO this doesn't work 
  return {
    a: 1, b: 's', log: (msg) => true, kill: function () { return 1 }
  }
}
function h(): Magallanes { //TODO: generates empty interface 
  return {
    a: 1, b: 's', log: (msg: boolean) => { return true }, kill: function () { return 1 }
  }
}
function fn<T>(): FNResult<T> { // THIS works
  return { a: 1, b: 's', log: (msg: string) => { return Math.random() > 0.1 ? true : 'foo' }, kill: function <T>() { return 1 } }
}
*/

// TODO: members type params (generics) - both in interface and in members and in params.
// arrow functions with return and without braces _ error!
// TODO: constructors
// TODO: getters / setters ? 
// TODO: test jsdoc
//TODO: check if diagnostic is in the same position  in predicate 
//TODO: appearing in places it shouldnt

import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { VariableDeclarationKind, FunctionDeclaration, TypeGuards, InterfaceDeclarationStructure, MethodSignatureStructure } from 'ts-simple-ast';
import { now, timeFrom, fromNow } from 'hrtime-now';

/** 

# Description

declare type for return value but no interface or class declaration is present for that - we create a new interface from return value 

# Attacks

"code": "2304",	"message": "Cannot find name 'GResult'.",

# Example, 

declare a function like the following - return type is not declared. The suggested fix is to declare it automatically based on the return value of the fn (using typechecking inference)

```
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => boolean, kill: function <T>() { return 1 } }
}
```

# TODO: 

 * we could offer three alternatives : declare interface, declare type or declare class

*/

export const declareReturnType: CodeFix = {
  name: 'declareReturnType',
  config: {},
  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier && arg.containingTargetLight.parent.kind === ts.SyntaxKind.TypeReference && arg.diagnostics.find(d => d.code === 2304 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log('declareReturnType predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },
  
  description: (arg: CodeFixOptions): string => `Declare interface "${arg.containingTarget.getText()}"`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const id = arg.simpleNode
    const decl = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
    const interfaceStructure = fromNow(
      () => inferReturnType(decl, arg),
      t => arg.log('declareReturnType apply inferReturnType took ' + t)
    )
    const siblingAncestor = arg.simpleNode.getAncestors().find(a => TypeGuards.isSourceFile(a.getParent()))
    if (siblingAncestor) {
      arg.simpleNode.getSourceFile().insertInterface(siblingAncestor.getChildIndex(), interfaceStructure)
    } else {
      arg.simpleNode.getSourceFile().addInterface(interfaceStructure)
    }
  }

}


const inferReturnType = (decl: FunctionDeclaration, arg: CodeFixOptions): InterfaceDeclarationStructure => {
  const project = arg.simpleProject
  const tmpSourceFile = fromNow(
    () => project.createSourceFile('tmp2.ts', decl.getText() + '; const tmp = ' + decl.getName() + '()', { overwrite: true }),
    (t) => arg.log('declareReturnType apply inferReturnType createSourceFile took ' + t)
  )
  const tmpDecl = tmpSourceFile.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)[0]
  const typeargs = tmpDecl.getReturnType().getTypeArguments()
  fromNow(
    () => tmpDecl.removeReturnType(),
    t => arg.log('declareReturnType apply inferReturnType tmpDecl.removeReturnType() took ' + t)
  )
  const tmp = tmpSourceFile.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration)
  const type = fromNow(
    () => project.getTypeChecker().getTypeAtLocation(tmp),
    t => arg.log('declareReturnType apply inferReturnType getTypeChecker().getTypeAtLocation took ' + t))

  const intStructureT0 = now()
  const intStructure = {
    name: decl.getReturnTypeNode().getText(),
    properties: type.getProperties()
      .filter(p => {
        const v = p.getValueDeclaration();
        return TypeGuards.isPropertyAssignment(v) && !v.getInitializer().getKindName().includes('Function')
      })
      .map(p => ({
        name: p.getName(),
        type: project.getTypeChecker().getTypeAtLocation(p.getValueDeclaration()).getText(),
        val: p.getValueDeclaration()
      })),
    methods: type.getProperties()
      .filter(p => {
        const v = p.getValueDeclaration();
        return TypeGuards.isPropertyAssignment(v) && v.getInitializer().getKindName().includes('Function')
      })
      .map(p => {
        const v = p.getValueDeclaration()
        if (!TypeGuards.isPropertyAssignment(v)) {
          return null
        }
        const init = v.getInitializer()
        if (!TypeGuards.isArrowFunction(init) && !TypeGuards.isFunctionExpression(init)) {
          return null
        }
        return {
          name: p.getName(),
          returnType: init.getReturnType() ? init.getReturnType().getText() : 'any',
          parameters: init.getParameters().map(pa => ({
            name: pa.getName(),
            type: pa.getType().getText()
          }))
        }
      })
      .filter(p => !!p),
    typeParameters: typeargs.map(ta => ({ name: ta.getSymbol().getName() })),
  }
  fromNow(() => tmpSourceFile.delete(), (t) => arg.log(`declareReturnType apply inferReturnType tmpSourceFile.delete() took ${t}`))
  arg.log('declareReturnType apply inferReturnType create InterfaceStructure took ' + timeFrom(intStructureT0))
  return intStructure
}