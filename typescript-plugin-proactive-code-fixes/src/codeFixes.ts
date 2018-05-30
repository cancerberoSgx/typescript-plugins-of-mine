import { Node, Project } from 'ts-simple-ast';
import * as ts from 'typescript';
import { codeFixCreateConstructor } from './code-fix/declareConstructor';
import { codeFixCreateVariable } from './code-fix/declareVariable';
import { declareClass } from './code-fix/declareClass';
import { const2let } from './code-fix/const2let';
import { nameFunction } from './code-fix/nameFunction';
import { declareReturnType } from './code-fix/declareReturnType';
import { declareMember } from './code-fix/declareMember';
import { addReturnStatement } from './code-fix/addReturnStatement';
import { implementInterfaceObjectLiteral } from './code-fix/ImplementInterfaceObjectLiteral';
import { implementInterfaceMember } from './code-fix/implementInterfaceMember';


export interface CodeFix {
  /**  */
  name: string,
  config: any,
  /** if needSimpleAst === false simple ast project won't be created (faster) and CodeFixOptions.simpleNode will be null. apply() will be 100 % responsible of impacting the changes using native mechanism like emit() or writeFileSync() sourceFile.update(), printer, etc */
  needSimpleAst?:boolean
  /** the predicate for getApplicableRefactors */
  predicate(arg: CodeFixOptions): boolean
  /** the description that will appear in the refactor label UI */
  description(arg: CodeFixOptions): string
  /** when user accept the suggestion this is called and implementation changes source file(s)*/
  apply(arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void
}

export const codeFixes: CodeFix[] = [codeFixCreateConstructor, codeFixCreateVariable, declareClass,  const2let, nameFunction, implementInterfaceObjectLiteral, declareReturnType, declareMember, addReturnStatement, implementInterfaceMember];

export interface CodeFixOptions {
  diagnostics: ts.Diagnostic[]
  containedTarget?: ts.Node|undefined
  log: (str: string) => void
  containingTarget: ts.Node | undefined
  simpleNode?: Node,
  program: ts.Program,
  sourceFile: ts.SourceFile,
  simpleProject?: Project
}
