import * as ts from 'typescript'

/** an abstract postfix transformation - most of the metadata is on its `config` */
export interface Postfix{
  config:PostfixConfig,
  /** the string that will trigger the auto-completion to user. For example "if" to wrap the
   * expression with if() */
  completion(): string
  /** decides if if this postfix should be suggested in code completions for given fileName and position
   * programmatically. **Please implement it fast** */
  predicate(opts: PostfixPredicateOptions): boolean
  // /**  */
  // subExpressionPredicate(fileName: string, position: number, target: ts.Node):ts.Node
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
  program:ts.Program, fileName: string, position: number, target: ts.Node
}

export interface PostfixPredicateOptions {
  fileName: string
  position: number
  target: ts.Node
}

/**
 * configuration for postfixes, since the UX is a completion, inherit from  `ts.CompletionEntry` is a 
 * good approximation in this first iteration
 */
export interface PostfixConfig extends ts.CompletionEntry {
}

// /** a postfix driven by a string template -  */
// export interface TemplatePostfix extends Postfix{
//   template: string
//   /** Predicate to control when to suggest the postfix. could be "identtifier", "binary", etc. similar as API
//    * in same API as https://github.com/ipatalas/vscode-postfix-ts  */
//   when: string
//   /**
//    * For implementing "subExpressionPredicate". Filter expressions the user can chooser by ascendancy level in
//    * the AST in case of complex expressions. 0 means choose the first inner one and don't show any completions
//    * to the user. 1 means only show to the user the first level expressions, 2 means, only show to the user
//    * 1st and second level expressions. If you want to show all, use a high number like 1000
//    */
//   subExpressionLevelPredicate: number
// }
