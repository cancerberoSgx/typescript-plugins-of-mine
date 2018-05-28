import { now, timeFrom } from 'hrtime-now';
import { HeritageClause, TypeGuards, ClassDeclaration, InterfaceDeclaration } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixNodeOptions } from '../codeFixes';

// TODO: issue - break  target class' jsdoc

// let classDecl: ts.ClassDeclaration | ts.InterfaceDeclaration | undefined

// function getClassDeclaration(arg: CodeFixNodeOptions): ts.ClassDeclaration |ts.InterfaceDeclaration | undefined {
//   // arg.simpleNode
//   if (arg.containingTarget.kind === ts.SyntaxKind.Identifier && arg.containingTarget.parent && arg.containingTarget.parent.parent && arg.containingTarget.parent.parent.kind === ts.SyntaxKind.HeritageClause) {
//     return arg.containingTarget.parent.parent.parent as ts.ClassDeclaration 
//   }
// if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.ExpressionWithTypeArguments && arg.containedTarget.parent && arg.containedTarget.parent.kind === ts.SyntaxKind.HeritageClause) {
//   return arg.containedTarget.parent.parent as ts.ClassDeclaration  |ts.InterfaceDeclaration |undefined 
// }
// }
// function getClassDeclaration(arg: CodeFixNodeOptions): ts.ClassDeclaration |ts.InterfaceDeclaration | undefined {

//   arg.log(`classDecl ${arg.containingTarget.getText()}  ${getKindName(arg.containingTarget)} classssssss ${arg.containingTarget.parent.getText()} ${getKindName(arg.containingTarget.parent)} `)
//   if (arg.containingTarget.kind === ts.SyntaxKind.Identifier && arg.containingTarget.parent && arg.containingTarget.parent.parent)/* && arg.containingTarget.parent.parent.kind === ts.SyntaxKind.HeritageClause) */{
//     return arg.containingTarget.parent.parent/*.parent*/ as ts.ClassDeclaration 
//   }
//   // if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.ExpressionWithTypeArguments && arg.containedTarget.parent && arg.containedTarget.parent.kind === ts.SyntaxKind.HeritageClause) {
//   //   return arg.containedTarget.parent.parent as ts.ClassDeclaration  |ts.InterfaceDeclaration |undefined 
//   // }
// }

let decl//: ClassDeclaration|InterfaceDeclaration
let isInterface
export const declareClass: CodeFix = {

  name: 'Declare Class',

  config: { inNewFile: false }, // TODO 

  predicate: (arg: CodeFixNodeOptions): boolean => {
    return true
  //   if (!arg.diagnostics.find(d => d.code === 2304)) {
  //     arg.log('declareClass predicate false because diagnostic code dont match:  ' + arg.diagnostics.map(d => d.code).join(', '))
  //     return false
  //   }
  //   decl = arg.simpleNode.getAncestors().find(a => TypeGuards.isClassDeclaration(a) || TypeGuards.isInterfaceDeclaration(a))
  //   if (!decl || !TypeGuards.isClassDeclaration(decl) && !TypeGuards.isInterfaceDeclaration(decl)) {
  //     arg.log(`declareClass WARNING decl ${decl && decl.getKindName()} not a class or interface decl`)
  //     return false
  //   }
  //   isInterface = TypeGuards.isInterfaceDeclaration(decl)
  //   return true;

  //   // classDecl = getClassDeclaration(arg)
  //   // if (classDecl) {
  //   //   return true
  //   // }
  //   // else {
  //   // arg.log('declareClass predicate false because arg.containingTarget.kind dont match ' + getKindName(arg.containingTarget.kind))
  //   // return false
  //   // }
  },

  description: (arg: CodeFixNodeOptions): string => {// TODO: guess if it si a class or interface
    return `Declare putas`  //${isInterface ? 'interface' : 'class'} "${arg.simpleNode.getText() || 'unknown'}"`
  },

  apply: (arg: CodeFixNodeOptions) => {
    arg.log('declareClass apply init')
    const code =
      `
  ${decl.isExported() ? 'export ' : ''}${isInterface ? 'interface' : 'class'} ${arg.simpleNode.getText()} {
  }
  `;

  arg.log('declareClass final code: '+code)
    arg.simpleSourceFile.insertText(decl.getStart(), code)
  }
}
