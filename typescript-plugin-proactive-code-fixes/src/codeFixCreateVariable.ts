import { Node, Scope, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { CodeFix } from './codeFixes';

// TODO: test with jsdoc or a trailing comment
export const codeFixCreateVariable: CodeFix = {
  name: 'Declare variable',
  config: { variableType: 'const' },
  predicate: (diag: ts.Diagnostic, child: ts.Node): boolean => diag.code === 2304 && // Cannot find name 'i'
    child.kind === ts.SyntaxKind.Identifier &&
    child.parent.kind === ts.SyntaxKind.BinaryExpression &&
    child.parent.parent.kind === ts.SyntaxKind.ExpressionStatement,
  description: (diag: ts.Diagnostic, child: ts.Node): string => `Declare variable "${child.getText()}"`,
  apply: (diag: ts.Diagnostic, child: Node): void => {
    child.getSourceFile().insertText(child.getStart(), 'const ')
  }
};
// registerCodeFix(codeFixCreateVariable)