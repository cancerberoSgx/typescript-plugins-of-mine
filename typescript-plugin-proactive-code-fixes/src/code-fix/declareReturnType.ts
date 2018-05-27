/*
Attacks this problem:   

"code": "2304",	"message": "Cannot find name 'GResult'.",

Example, you declare a function like the following - return type is not declared. The suggested fix is to declare it automatically based on the return value of the fn (using typechecking inference)

function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => boolean, kill: function <T>() { return 1 } }
}
*/


// Attacks the following error by changing const declaration to let : 
// 	"code": "2540",
// 	"message": "Cannot assign to 'a' because it is a constant or a read-only property.",

import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { VariableDeclarationKind, FunctionDeclaration, TypeGuards } from 'ts-simple-ast';

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
    arg.log('declareReturnType apply starts : '+id.getKindName() + ' - '+decl.getKindName())
    const intStruct = inferReturnType(decl, arg)
    arg.log('declareReturnType apply interface structure: '+intStruct)
    arg.simpleNode.getSourceFile().addInterface(intStruct)
  }

}


const inferReturnType = (decl: FunctionDeclaration, arg: CodeFixOptions) => {
  const project = arg.simpleProject
  const tmpSourceFile = project.createSourceFile('tmp2.ts', decl.getText() + '; const tmp = ' + decl.getName() + '()')
  const tmpDecl = tmpSourceFile.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration)[0]
  const typeargs = tmpDecl.getReturnType().getTypeArguments()
  tmpDecl.removeReturnType()
  const tmp = tmpSourceFile.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration)
  const type = project.getTypeChecker().getTypeAtLocation(tmp)//.getApparentProperties().map(p=>p.getName()).join(',')//.getText()
  const intStructure = {
    name: decl.getReturnTypeNode().getText(),
    properties: type.getProperties()
      .filter(p => { const v = p.getValueDeclaration(); return TypeGuards.isPropertyAssignment(v) && !v.getInitializer().getKindName().includes('Function') })
      .map(p => ({
        name: p.getName(),
        type: project.getTypeChecker().getTypeAtLocation(p.getValueDeclaration()).getText(),
        val: p.getValueDeclaration()
      })),
    methods: type.getProperties()
      .filter(p => { const v = p.getValueDeclaration(); return TypeGuards.isPropertyAssignment(v) && v.getInitializer().getKindName().includes('Function') })
      .map(p => ({
        name: p.getName(),
        returnType: project.getTypeChecker().getTypeAtLocation(p.getValueDeclaration()).getText(),
        parameters: ((p) => {
          const v = p.getValueDeclaration();
          if (!TypeGuards.isPropertyAssignment(v)) { return [] };
          const init = v.getInitializer();
          if (!TypeGuards.isFunctionLikeDeclaration(init)) { return [] };
          return init.getParameters().map(pa => ({ name: pa.getName(), type: pa.getType().getText() }))
        })(p)
      })),
    typeParameters: typeargs.map(ta => ({ name: ta.getSymbol().getName() })),
  }
  tmpSourceFile.delete()
  return intStructure
}