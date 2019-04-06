import { Node, TypeGuards } from 'ts-morph'
import { getChildrenForEachChild } from '../node'
import { AstPath, ASTPathNode, BuildAstPathOptions } from './types'
/**
 * Creates a selector like `0/4/3/` where numbers are the child index of the node on that level with respect
 * to the parent (getChildIndex()), starting from the sourceFile.
 *
 * TODO. add a second destination node that by default is the SourceFile
 */
export function buildAstPath(
  node: Node,
  fromAncestor: Node = node.getSourceFile(),
  options: BuildAstPathOptions = {}
): AstPath {
  let path: ASTPathNode[] = []
  let list = node.getAncestors()
  if (!TypeGuards.isSourceFile(fromAncestor)) {
    list.splice(0, list.findIndex(node => node === fromAncestor))
  }
  list.reverse().forEach(a => {
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
