import * as ts from 'typescript'

/** an abstract postfix transformation - most of the metadata is on its `config` */
export interface Postfix{
  config:PostfixConfig,
  /** decides if if this postfix should be suggested in code completions for given fileName and position
   * programmatically. **Please implement it fast** */
  predicate(opts: PostfixPredicateOptions): boolean
  /** User selected this Postfix - this method implements the code transformation */
  execute(opts: PostfixExecuteOptions):PostfixExecuteResult
}
/**
 * value returned by postfix implementation execute() method. This is contract between plugin 
 * getCompletionEntryDetails() implementor and plugin implementation (for ex class `DeclareVariablePostFix`) 
 * They colaborate to update the Sourcefile somehow, hopefully using ts.CompletionEntryDetails if possible
 */
export interface PostfixExecuteResult{

}

export interface PostfixExecuteOptions {
  program:ts.Program, fileName: string, position: number, target: ts.Node, log: (msg:string)=>void
}

export interface PostfixPredicateOptions {
  fileName: string
  position: number
}

/**
 * configuration for postfixes, since the UX is a completion, inherit from  `ts.CompletionEntry` is a 
 * good approximation in this first iteration
 */
export interface PostfixConfig extends ts.CompletionEntry {
}
