import { Node } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, PredicateArg } from '../codeFixes';

// TODO: test with jsdoc or a trailing comment

// ISSUE : declare variable "new A(1)" - if in a new statement dont suggest

export const codeFixCreateVariable: CodeFix = {

  name: 'Declare variable',

  config: { variableType: 'const' },

  predicate: (arg: PredicateArg): boolean => {
    if (!arg.diagnostics.find(d => d.code === 2304 || d.code === 2540)) {
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

  description: (arg: PredicateArg): string => `Declare variable "${arg.containingTarget.getText()}"`,

  apply: (arg: PredicateArg): void => {
    arg.simpleNode.getSourceFile().insertText(arg.simpleNode.getStart(), 'const ')
  }

}