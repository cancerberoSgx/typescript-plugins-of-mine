import * as ts from 'typescript';
import { getKindName} from 'typescript-ast-util';
import { CodeFix, PredicateArg } from '../codeFixes';
import { createWrappedNode, ClassDeclaration } from 'ts-simple-ast';
// import typescript from 'ts-simple-ast';
// const ts = typescript.
// import * as ts from 'ts-simple-ast'

export const declareClass: CodeFix = {

  name: 'Declare Class',

  config: { inNewFile: false }, // TODO 

  needSimpleAst: false,

  predicate: (arg: PredicateArg): boolean => {
    if (!arg.diagnostics.find(d => d.code === 2304)) {
      arg.log('declareClass predicate false because diagnostic code dont match:  ' + arg.diagnostics.map(d => d.code).join(', '))
      return false
    }
    classDecl = getClassDeclaration(arg)
    if (classDecl) {
      return true
    }
    else {
      arg.log('declareClass predicate false because arg.containingTarget.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },

  description: (arg: PredicateArg): string => {// TODO: guess if it si a class or interface
    return `Declare class or interface "${classDecl.name || 'unknown'}"`
  },

  apply: (arg: PredicateArg) => {
    const simpleClassDec = createWrappedNode(classDecl as any) as ClassDeclaration;
    simpleClassDec.getSourceFile().insertText(arg.simpleNode.getStart(), 'const ')
    simpleClassDec.getSourceFile().saveSync()
  }

}

// const compilerNode:ts.ClassDeclaration = {} as any
// const simpleNode:ClassDeclaration = createWrappedNode(compilerNode) as ClassDeclaration


let classDecl: ts.ClassDeclaration | undefined
function getClassDeclaration(arg: PredicateArg): ts.ClassDeclaration | undefined {
  if (arg.containingTarget.kind === ts.SyntaxKind.Identifier && arg.containingTarget.parent && arg.containingTarget.parent.parent && arg.containingTarget.parent.parent.kind === ts.SyntaxKind.HeritageClause) {
    return arg.containingTarget.parent.parent.parent as ts.ClassDeclaration
  }
  if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.ExpressionWithTypeArguments && arg.containingTarget.kind === ts.SyntaxKind.ClassDeclaration && arg.containedTarget.parent && arg.containedTarget.parent.kind === ts.SyntaxKind.HeritageClause) {
    return arg.containedTarget.parent.parent as ts.ClassDeclaration
  }
}