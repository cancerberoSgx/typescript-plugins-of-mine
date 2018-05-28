import  Project, { Node,  SourceFile } from 'ts-simple-ast';
import * as ts from 'typescript';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { codeFixCreateConstructor } from './code-fix/declareConstructor';
import { codeFixCreateVariable } from './code-fix/declareVariable';
import { declareClass } from './code-fix/declareClass';
import { const2let } from './code-fix/const2let';
import { nameFunction } from './code-fix/nameFunction';
import { objectLiteralImplementInterface } from './code-fix/objectLiteralImplementInterface';
import { declareReturnType } from './code-fix/declareReturnType';
import { declareMember } from './code-fix/declareMember';
import { addReturnStatement } from './code-fix/addReturnStatement';
import { exec } from 'shelljs';
import { common } from './common';
import { StringLiteral } from 'typescript';


export interface CodeFix {
  /**  */
  name: string,
  config: any,
  // /** if needSimpleAst === false simple ast project won't be created (faster) and CodeFixOptions.simpleNode will be null. apply() will be 100 % responsible of impacting the changes using native mechanism like emit() or writeFileSync() sourceFile.update(), printer, etc */
  // needSimpleAst?:boolean
  /** the predicate for getApplicableRefactors */
  predicate(arg: CodeFixNodeOptions): boolean
  /** the description that will appear in the refactor label UI */
  description(arg: CodeFixNodeOptions): string
  /** when user accept the suggestion this is called and implementation changes source file(s)*/
  apply(arg: CodeFixNodeOptions): ts.ApplicableRefactorInfo[] | void
}

export const codeFixes: CodeFix[] = [common, declareClass, /* codeFixCreateConstructor, codeFixCreateVariable, const2let, nameFunction, objectLiteralImplementInterface, declareReturnType, declareMember, addReturnStatement*/];

export interface CodeFixNodeOptions extends CodeFixFileOptions {
  containedTarget?: ts.Node|undefined
  containingTarget: ts.Node | undefined
  simpleNode?: Node
  range?: ts.TextRange
}
export interface CodeFixFileOptions extends CodeFixProjectOptions{
  sourceFile: ts.SourceFile,
  fileName?: string
  diagnostics?: ts.Diagnostic[]
  simpleSourceFile?: SourceFile
  formatOptions?: ts.FormatCodeSettings
}

export interface CodeFixProjectOptions {
  program: ts.Program,
  simpleProject?: Project,
  project?: ts_module.server.Project,
  log: (str: string) => void
}