import { SyntaxKind } from 'ts-morph'

export interface BuildAstPathOptions {
  /**
   * Mode on which node's children are obtained (i.e.) `getChildren()` vs `forEachChildren()`. Default value: `forEachChildren()`
   */
  mode?: 'getChildren' | 'forEachChildren'
  /**
   * Includes or not node kind so select() can verify they match when selecting besides just navigating
   * through the children node's indexes
   */
  includeNodeKind?: boolean
  /**
   TODO 
   
   If true the selector will also contain the path from the root node to its source file so select can
   verify this. 
   */
  includePathToSourceFile?: boolean
}

export interface ASTPathNode {
  /** index of current node relative to is parent according to [[]] */
  index: number
  nodeKind?: SyntaxKind
  parentKind?: SyntaxKind
}

/**
 * This object is valid JSON so it can be serialized with `JSON.stringify`
 */
export interface AstPath {
  // selector: string
  path: ASTPathNode[]
  createOptions: BuildAstPathOptions
}

export interface SelectOptions {
  /**
   * TODO
   *
   * If true and the Ast path includes them, it will verify that each node kind on the path matches the AST's
   */
  verifyNodeKind?: boolean
}
