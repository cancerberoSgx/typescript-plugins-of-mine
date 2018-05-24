import * as ts from 'typescript'

/** an abstract postfix transformation */
export interface Postfix{
  /** id */
  name: string
  /** a description for this postfix transformation */
  description: string
  /** the string that will trigger the auto-completion to user. For example "if" to wrap the
   * expression with if() */
  completion: string
  /** decides if if this postfix should be suggested in code completions for given fileName and position
   * programmatically. **Please implement it fast** */
  predicate(fileName: string, position: number): boolean
  /**  */
  subExpressionPredicate(fileName: string, position: number):ts.Node
  /** User selected this Postfix - this method implements the code transformation */
  execute(expression: ts.Node, fileName: string, position: number)
}


/** a postfix driven by a string template -  */
export interface TemplatePostfix extends Postfix{
  template: string
  /** Predicate to control when to suggest the postfix. could be "identtifier", "binary", etc. similar as API
   * in same API as https://github.com/ipatalas/vscode-postfix-ts  */
  when: string
  /**
   * For implementing "subExpressionPredicate". Filter expressions the user can chooser by ascendancy level in
   * the AST in case of complex expressions. 0 means choose the first inner one and don't show any completions
   * to the user. 1 means only show to the user the first level expressions, 2 means, only show to the user
   * 1st and second level expressions. If you want to show all, use a high number like 1000
   */
  subExpressionLevelPredicate: number 
}
