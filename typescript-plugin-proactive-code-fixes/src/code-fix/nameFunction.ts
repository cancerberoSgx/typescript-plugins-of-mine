// attacks function declarations without names when they are not called
// 	"code": "1003",
// 	"message": "Identifier expected."


import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

export const nameFunction: CodeFix = {
  name: 'nameFunction',
  config: { newName: 'unnamedFunction' },
  predicate: (arg: CodeFixOptions): boolean => {
    if (!arg.diagnostics.find(d => d.code === 1003)) {
      return false
    }
    if (arg.containingTarget && ts.isFunctionDeclaration(arg.containingTarget) && (!arg.containingTarget.name || !arg.containingTarget.name.getText()) || (arg.containedTarget && arg.containedTarget.parent &&ts.isFunctionDeclaration(arg.containedTarget.parent) && (!arg.containedTarget.parent.name || !arg.containedTarget.parent.name.getText()))) {
      return true
    }
    else {
      arg.log(`nameFunction predicate false because ${arg.containingTarget && getKindName(arg.containingTarget)}  ${arg.containedTarget && getKindName(arg.containedTarget)} ${arg.containedTarget.parent && getKindName(arg.containedTarget.parent)} ${arg.containedTarget && arg.containedTarget.parent && arg.containedTarget.parent.parent && arg.containedTarget.parent.parent && getKindName(arg.containedTarget.parent.parent)} is not FunctionDeclaration or has name`)
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Name Function`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const f = TypeGuards.isFunctionDeclaration(arg.simpleNode) ? arg.simpleNode : arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
    if (!f || f.getName()) {
      arg.log(`nameFunction apply cannot exec because ${f.getKindName()} is not FunctionDeclaration or has name`)
      return
    }
    else {
      const start = f.getNameNode().getStart();
      f.getSourceFile().insertText(f.getNameNode().getStart(), ' unnamedFunction')
    }
  }

}