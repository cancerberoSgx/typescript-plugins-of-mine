import { Node } from 'ts-morph'
import { getChildrenForEachChild } from '../node'
import { BuildAstPathOptions, AstPath, ASTPathNode } from './types'
/**
 * Creates a selector like `0/4/3/` where numbers are the child index of the node on that level with respect
 * to the parent (getChildIndex()), starting from the sourceFile
 */
export function buildSelector(node: Node, options: BuildAstPathOptions = {}): AstPath {
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
