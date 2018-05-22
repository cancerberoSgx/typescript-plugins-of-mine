import { Node } from 'ts-simple-ast';
import * as ts from 'typescript';
import { codeFixCreateConstructor } from './code-fix/codeFixCreateConstructor';
import { codeFixCreateVariable } from './code-fix/codeFixCreateVariable';
import { declareClass } from './code-fix/declareClass';


export interface CodeFix {
  name: string,
  config: any,
  /** if needSimpleAst === false simple ast project won't be created (faster) and node in apply() wont be passed */
  needSimpleAst?:boolean
  predicate(arg: PredicateArg): boolean
  description(arg: PredicateArg): string
  apply(arg: PredicateArg)
}

export const codeFixes: CodeFix[] = [codeFixCreateConstructor, codeFixCreateVariable, declareClass];

export interface PredicateArg {
  diagnostics: ts.Diagnostic[]
  containedTarget?: ts.Node|undefined
  log: (str: string) => void
  containingTarget: ts.Node | undefined
  simpleNode?: Node,
  program: ts.Program
}
