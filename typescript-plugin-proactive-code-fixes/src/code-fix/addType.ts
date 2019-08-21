
import { VariableDeclarationKind, TypeGuards, VariableDeclaration, FunctionDeclaration, MethodDeclaration, ParameterDeclaration, PropertyDeclaration } from 'ts-morph';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { buildRefactorEditInfo } from '../util';

/*

# description

suggest to add a type to variable declaration, function declarations, property/method declarations and parameter declarations that doesn't explicit one

  */
export const addType: CodeFix = {

  name: 'addType',

  config: {
  },

  predicate: (arg: CodeFixOptions): boolean => {
    const parent = arg.containingTargetLight.parent
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier && (
      (ts.isVariableDeclaration(parent) && !parent.type) ||
      (ts.isFunctionDeclaration(parent) && !parent.type)||
      (ts.isMethodDeclaration(parent) && !parent.type)||
      (ts.isPropertyDeclaration(parent) && !parent.type)||
      (ts.isParameter(parent) && !parent.type)
    )) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => {
    return 'Add type to '+arg.containingTargetLight.getText()
  },

  apply: (arg: CodeFixOptions) => {
    const node = arg.simpleNode
    if(TypeGuards.isVariableDeclaration(node.getParent())){
      const varDecl = node.getParent() as VariableDeclaration
      return buildRefactorEditInfo(arg.sourceFile, `: ${varDecl.getType().getBaseTypeOfLiteralType().getText()}`, node.getEnd())
      // varDecl.setType(varDecl.getType().getBaseTypeOfLiteralType().getText())
    }  
    else if(TypeGuards.isFunctionDeclaration(node.getParent())){
      const parent = node.getParent() as FunctionDeclaration
      return buildRefactorEditInfo(arg.sourceFile, `: ${parent.getReturnType().getText()}`, parent.getFirstChildByKind(ts.SyntaxKind.Block).getStart()-1)
      // parent.setReturnType(parent.getReturnType().getText())
    }  
    else if(TypeGuards.isMethodDeclaration(node.getParent())){
      const parent = node.getParent() as MethodDeclaration
      return buildRefactorEditInfo(arg.sourceFile, `: ${parent.getReturnType().getText()}`, parent.getFirstChildByKind(ts.SyntaxKind.Block).getStart()-1)
      // parent.setReturnType(parent.getReturnType().getText())
    }  
    else if(TypeGuards.isPropertyDeclaration(node.getParent())){
      const parent = node.getParent() as PropertyDeclaration
      return buildRefactorEditInfo(arg.sourceFile, `: ${parent.getType().getText()}`, node.getEnd())
      // parent.setReturnType(parent.getReturnType().getText())
    }  
    else if(TypeGuards.isParameterDeclaration(node.getParent())){
      const parent = node.getParent() as ParameterDeclaration
      return buildRefactorEditInfo(arg.sourceFile, `: ${parent.getType().getText()}`, node.getEnd())
      // parent.setReturnType(parent.getReturnType().getText())
    }  
  }

}
