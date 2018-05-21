import { Node, Scope, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { codeFixCreateConstructor } from './codeFixCreateConstructor';
import { codeFixCreateVariable } from './codeFixCreateVariable';

export interface CodeFix {
  name: string
  config: any
  predicate(diag: ts.Diagnostic, child: ts.Node): boolean
  description(diag: ts.Diagnostic, child: ts.Node): string
  apply(diag: ts.Diagnostic, child: Node): void
}

export const codeFixes:CodeFix[] = [codeFixCreateConstructor, codeFixCreateVariable];
