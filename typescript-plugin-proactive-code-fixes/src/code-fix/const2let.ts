// show demo - first createVariable const then reasign and then const2let

// Attacks the following error by changing const declaration to let : 
// 	"code": "2540",
// 	"message": "Cannot assign to 'a' because it is a constant or a read-only property.",

import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

export const codeFixCreateVariable: CodeFix = {
  name: 'const to let',
  config: { changeTo: 'const' }, // to change to let or var
  predicate: (arg: CodeFixOptions): boolean => {
    if (!arg.diagnostics.find(d => d.code === 2540)) {
      return false
    }
    if (arg.containingTarget.kind === ts.SyntaxKind.BinaryExpression ||
      arg.containingTarget.parent && arg.containingTarget.parent.kind === ts.SyntaxKind.BinaryExpression ||
      arg.containingTarget.parent.parent && arg.containingTarget.parent.parent.kind === ts.SyntaxKind.BinaryExpression) {
      return true
    }
    else {
      arg.log('codeFixCreateVariable predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Declare variable "${arg.containingTarget.getText()}"`,

  apply: (arg: CodeFixOptions): void => {
    arg.simpleNode.getSourceFile().insertText(arg.simpleNode.getStart(), 'const ')
  }

}