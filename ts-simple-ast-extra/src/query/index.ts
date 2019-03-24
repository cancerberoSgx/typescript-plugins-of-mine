import { Node, SourceFile, SyntaxKind } from 'ts-morph'
import { getChildrenForEachChild } from '../node'
/**
 * Creates a selector like `0/4/3/` where numbers are the child index of the node on that level with respect
 * to the parent (getChildIndex()), starting from the sourceFile
 */
export function buildAstSelector(node: Node, options: BuildAstPathOptions = {}): AstPath {
  let path: ASTPathNode[] = []
  node
    .getAncestors()
    .reverse()
    .forEach((a, i) => {
      const index = a.getParent() ? getChildrenForEachChild(a.getParent()).findIndex(c => c === a) : 0
      path.push({
        index,
        ...(options.includeNodeKind
          ? { nodeKind: a.getKind(), parentKind: a.getParent() ? a.getParent()!.getKind() : undefined }
          : {})
      })
    })
  return {
    path,
    createOptions: options
  }
}

interface BuildAstPathOptions {
  // /**
  //  * TODO
  //  *  Mode on which node's children are obtained (i.e.) `getChildren()` vs `forEachChildren()`.
  //  */
  // mode?: 'getChildren'|'forEachChildren'
  /**
   * Includes or not node kind so select() can verify they match when selecting besides just nevigating through the children node's indexes
   */
  includeNodeKind?: boolean
  // TODO: we could add `includeKinds` to
}

interface ASTPathNode {
  /** index of current node relative to is parent according to [[]] */

  index: number
  nodeKind?: SyntaxKind
  parentKind?: SyntaxKind
}

interface AstPath {
  path: ASTPathNode[]
  createOptions: BuildAstPathOptions
  // /**
  //  * TODO
  //  * Path from the parent to its SourceFile.
  //  */
  // parentToRootPath?: ASTPathNode[]
}
interface SelectOptions {
  // /**
  //  * If true we throw in case there's amismatch in node path kind and the actual AST nodes
  //  */
  // verifyNodeKind?: boolean
}
/**
 * inverse operation than buildAstPath, it will loop up for a node in a sourceFile given a path
 * @param path
 * @param rootNode
 */
export function selectFromAst<T extends Node>(
  astPath: AstPath,
  rootNode: Node,
  options?: SelectOptions
): T | undefined {
  let n: Node = rootNode
  let c: Node | undefined
  //  let pathNodes =  path.split('/').filter(a=>a)
  //  .map(i=>parseInt(i))
  let { path } = astPath
  const tail = path.slice(1, path.length)
    //  path = [...tail, path[0]]
    //  path
  ;[...tail, path[0]].forEach(pathNode => {
    const children = getChildrenForEachChild(n)
    c = children[pathNode.index]
    n = c
  })
  return n as T
}
