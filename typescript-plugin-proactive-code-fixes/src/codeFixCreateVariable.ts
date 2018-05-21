import { Node } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix } from './codeFixes';

// TODO: test with jsdoc or a trailing comment


export const codeFixCreateVariable: CodeFix = {

  name: 'Declare variable',

  config: { variableType: 'const' },

  predicate: (diag: ts.Diagnostic[], child: ts.Node, log): boolean => {
    if (!diag.find(d => d.code === 2304 || d.code === 2540)) {
      return false
    }
    if (child.kind === ts.SyntaxKind.BinaryExpression ||
      child.parent && child.parent.kind === ts.SyntaxKind.BinaryExpression ||
      child.parent.parent && child.parent.parent.kind === ts.SyntaxKind.BinaryExpression) {
      return true
    }
    else {
      log('codeFixCreateVariable predicate false because child.kind dont match ' + getKindName(child.kind))
      return false
    }
  },

  description: (diag: ts.Diagnostic[], child: ts.Node): string => `Declare variable "${child.getText()}"`,

  apply: (diag: ts.Diagnostic[], child: Node): void => {
    child.getSourceFile().insertText(child.getStart(), 'const ')
  }

}