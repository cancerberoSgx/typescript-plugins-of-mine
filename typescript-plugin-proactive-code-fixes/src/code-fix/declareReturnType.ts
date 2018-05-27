/*
Attacks this problem:   

"code": "2304",	"message": "Cannot find name 'GResult'.",

Example, you declare a function like the following - return type is not declared. The suggested fix is to declare it automatically based on the return value of the fn (using typechecking inference)

function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => boolean, kill: function <T>() { return 1 } }
}
*/


import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { VariableDeclarationKind, FunctionDeclaration, TypeGuards, InterfaceDeclarationStructure, MethodSignatureStructure } from 'ts-simple-ast';
import { now, timeFrom, fromNow } from 'hrtime-now';

export const declareReturnType: CodeFix = {
  name: 'declareReturnType',
  config: {  },  
  predicate: (arg: CodeFixOptions): boolean => {
    if (!arg.diagnostics.find(d => d.code === 2304)) {
      return false
    }
    if (arg.containingTarget.kind === ts.SyntaxKind.Identifier) {
      // in this case user selected a fragment of the id. quick issue fix: 
      if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.SourceFile) {
        arg.containedTarget = undefined
      }
      return true
    }
    else if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.Identifier) {
      // user selected the exactly the id (double click)
      return true
    }
    else {
      arg.log('declareReturnType predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },
  description: (arg: CodeFixOptions): string => `Declare Type "${arg.containingTarget.getText()}" interring from return value`,
  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const id = arg.simpleNode
    const decl = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
    // arg.log('declareReturnType apply starts : '+id.getKindName() + ' - '+decl.getKindName())
    const intStruct = fromNow(
      ()=>inferReturnType(decl, arg), 
      t=> arg.log('declareReturnType apply inferReturnType took '+t)
    )
    arg.simpleNode.getSourceFile().addInterface(intStruct)
  }

}


const inferReturnType = (decl: FunctionDeclaration, arg: CodeFixOptions):InterfaceDeclarationStructure => {
  const project = arg.simpleProject
  const tmpSourceFile = fromNow(
    ()=>project.createSourceFile('tmp2.ts', decl.getText() + '; const tmp = ' + decl.getName() + '()'), 
    (t)=>arg.log('declareReturnType apply inferReturnType createSourceFile took '+t)
  )
  const tmpDecl = tmpSourceFile.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)[0]
  // const typeargs = tmpDecl.getReturnType().getTypeArguments()
  fromNow(
    ()=>tmpDecl.removeReturnType(), 
    t=>arg.log('declareReturnType apply inferReturnType tmpDecl.removeReturnType() took '+t)
  )
  const tmp = tmpSourceFile.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration)
  const type = fromNow(
    ()=>project.getTypeChecker().getTypeAtLocation(tmp), 
    t=>arg.log('declareReturnType apply inferReturnType getTypeChecker().getTypeAtLocation took '+t))

  const intStructureT0= now()
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
            returnType: init.getReturnType() ? init.getReturnType().getText():  'any',
            parameters: init.getParameters().map(pa => ({
              name: pa.getName(), 
              type: pa.getType().getText() 
            }))
          }
        })
        .filter(p=>!!p),
      // typeParameters: typeargs.map(ta => ({ name: ta.getSymbol().getName() })),
  }
  arg.log('declareReturnType apply inferReturnType create InterfaceStructure took '+ timeFrom(intStructureT0))
  fromNow(()=>tmpSourceFile.delete(), (t)=>arg.log(`declareReturnType apply inferReturnType tmpSourceFile.delete() took ${t}`))
  return intStructure
}