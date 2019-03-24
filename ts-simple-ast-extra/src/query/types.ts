import { SyntaxKind } from 'ts-morph'
let types
export interface BuildAstPathOptions {
  // /**
  //  * TODO
  //  *  Mode on which node's children are obtained (i.e.) `getChildren()` vs `forEachChildren()`.
  //  */
  // mode?: 'getChildren'|'forEachChildren'
  /**
   * Includes or not node kind so select() can verify they match when selecting besides just nevigating through the children node's indexes
   */
  includeNodeKind?: boolean
}
export interface ASTPathNode {
  /** index of current node relative to is parent according to [[]] */
  index: number
  nodeKind?: SyntaxKind
  parentKind?: SyntaxKind
}
export interface AstPath {
  path: ASTPathNode[]
  createOptions: BuildAstPathOptions
}
export interface SelectOptions {}
