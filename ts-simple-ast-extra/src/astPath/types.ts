import { SyntaxKind } from 'ts-morph'

export interface BuildAstPathOptions {
  /**
   * Mode on which node's children are obtained (i.e.) `getChildren()` vs `forEachChildren()`. Default value:
   * `forEachChildren()`
   */
  mode?: 'getChildren' | 'forEachChildren'

  /**
   * Includes or not node kind so select() can verify they match when selecting besides just navigating
   * through the children node's indexes
   */
  includeNodeKind?: boolean

  /**
   * If true it will save the nodes names. Take into account that creating selectors could have some overhead
   * compared to not including this data.
   */
  includeNodeName?: boolean

  /**
   TODO 

   If true the selector will also contain the path from the root node to its source file so select can verify
   this. 
   */
  includePathToSourceFile?: boolean
}

export interface ASTPathNode {
  /**
   * Index of current node relative to is parent according to [[mode]] option.
   */
  index: number
  /**
   * If configured so it stores the node's syntax kind value.
   */
  nodeKind?: SyntaxKind
  /**
   * If configured so it stores the node's name (or syntax kind name if it no name.
   */
  nodeName?: string
  /**
   * If configured so it stores the node parent's syntax kind value.
   */
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
