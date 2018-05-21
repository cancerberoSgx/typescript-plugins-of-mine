import { Node, Scope, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { codeFixCreateConstructor } from './codeFixCreateConstructor';
import { codeFixCreateVariable } from './codeFixCreateVariable';

export interface CodeFix {
  name: string,
  config: any,
  predicate(diag: ts.Diagnostic[], child: ts.Node, log: (str:string)=>void): boolean
  description(diag: ts.Diagnostic[], child: ts.Node): string
  apply(diagnostics: ts.Diagnostic[], child: Node, log: (str:string)=>void): void
}

export const codeFixes:CodeFix[] = [codeFixCreateConstructor, codeFixCreateVariable];
