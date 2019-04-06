// general interfaces used by some of my plugins that contains several refactors and are based on ts-simple-ast

import { Node, Project, ts } from 'ts-morph'

export interface CodeFix {
  name: string

  config: any

  /** TODO: remove this. if needSimpleAst === false simple ast project won't be created (faster) and CodeFixOptions.simpleNode will be null. apply() will be 100 % responsible of impacting the changes using native mechanism like emit() or writeFileSync() sourceFile.update(), printer, etc */
  needSimpleAst?: boolean

  /** the predicate for getApplicableRefactors */
  predicate(arg: CodeFixOptions): boolean

  /** the description that will appear in the refactor label UI */
  description(arg: CodeFixOptions): string

  /** when user accept the suggestion this is called and implementation changes source file(s)*/
  apply(arg: CodeFixOptions): ts.RefactorEditInfo | string | void
}

/** contains lots of data used by code fix to build the predicate, description and apply the refactor. Is provided by plugin implementation */
export interface CodeFixOptions {
  diagnostics: ts.Diagnostic[]
  containedTarget?: ts.Node | undefined
  log: (str: string) => void
  containingTarget: ts.Node
  containingTargetLight: ts.Node
  simpleNode?: Node
  program: ts.Program
  sourceFile: ts.SourceFile
  simpleProject?: Project
  positionOrRange?: number | ts.TextRange
}
