import { now, timeFrom } from 'hrtime-now';
import { HeritageClause, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

// TODO: issue - break  target class' jsdoc

let classDecl: ts.ClassDeclaration | ts.InterfaceDeclaration | undefined

function getClassDeclaration(arg: CodeFixOptions): ts.ClassDeclaration |ts.InterfaceDeclaration | undefined {
  if (arg.containingTarget.kind === ts.SyntaxKind.Identifier && arg.containingTarget.parent && arg.containingTarget.parent.parent && arg.containingTarget.parent.parent.kind === ts.SyntaxKind.HeritageClause) {
    return arg.containingTarget.parent.parent.parent as ts.ClassDeclaration 
  }
  if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.ExpressionWithTypeArguments && arg.containedTarget.parent && arg.containedTarget.parent.kind === ts.SyntaxKind.HeritageClause) {
    return arg.containedTarget.parent.parent as ts.ClassDeclaration  |ts.InterfaceDeclaration |undefined 
  }
}

export const declareClass: CodeFix = {

  name: 'Declare Class',

  config: { inNewFile: false }, // TODO 

  predicate: (arg: CodeFixOptions): boolean => {
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

  description: (arg: CodeFixOptions): string => {// TODO: guess if it si a class or interface
    return `Declare class or interface "${classDecl.name && classDecl.name.getText() || 'unknown'}"`
  },

  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    const id = arg.simpleNode
    const simpleClassDec = id.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
    let h: HeritageClause

    if (!TypeGuards.isHeritageClause(h = id.getFirstAncestorByKind(ts.SyntaxKind.HeritageClause))) {
      return
    }

    const code =
      `
${simpleClassDec.isExported() ? 'export ' : ''}${h.getToken() === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'} ${id.getText()} {

}

`
    arg.simpleNode.getSourceFile().insertText(simpleClassDec.getStart(), code)
    arg.log('apply took ' + timeFrom(t0))
  }

}
