import { Node, SourceFile, isSourceFile } from 'typescript'
import { getKindName, getChildren, findChild, visitChildrenRecursiveDeepFirst } from 'typescript-ast-util'

/**
 * Installs ids on each node recursively starting on given node. Use `getId` on any node to obtain ids id and
 * `getNodeById` to query a node from a parent one using its id. 
 *
 * In general users will provide a SourceFile so the entire AST Nodes filled with ids, but it could also pass
 * a fragment hierarchy, for example, to be faster in case only that fragment is invalidated / modified (see
 * uninstall method)
 * 
 * If given node's parent doesn't' have an id, the whole source file will be installed with ids.
 * 
 * @returns the node from which ids were effectively installed
 */
export function install(node: Node): Node {
  let startingId: Id | undefined
  if (isSourceFile(node)) {
    startingId = '0'
  }
  else if (node.parent && getId(node.parent)) {
    startingId = getId(node.parent)!
  }
  else {
    // installing ids on whole source tree since given node's parent doesn't have id
    node = node.getSourceFile()
    startingId = '0'
  }
  setId(node, startingId)
  visitChildrenRecursiveDeepFirst(node, (child: Node, index, level) => setId(child, `${child.parent ? getId(child.parent) : '0'}.${index}`))
  return node
}

/**
 * Return the first descendant of given parent node with given id or undefined if none is found
 */
export function getNodeById(parent: Node, id: Id): Node | undefined {

  // TODO very very slow implementation we should use next getChildMatchingId declaration or similar - get indexes and kinds from ids, never iterate1

  return findChild(parent, child => getId(child) === id)

  // const child = getChildMatchingId(parent, id)
  // const children = getChildren(parent)
  // throw new Error('Not implemented')
}

// function getChildMatchingId(parent: Node, id: Id): Node | undefined {
//   const parentId = getId(parent)
//   if (!parentId) { // this could be the case user didn't use install and just setId to some nodes , see `setId`
//     return findChild(parent, child => getId(child)===id, true)
//   }
//   let firstDotIndex: number
//   if ((firstDotIndex = parentId.indexOf('.')) !== -1) {
//     //no dot means it doesn't have children
//     return undefined
//   }
//   const descendantId = parentId.substring(firstDotIndex + 1, parentId.length)
//   let childId: string | undefined
//   // TODO: parse id get index / kind and go directly to the right child instead of iterate 
//   return findChild(parent, child => !!(childId = getId(child)) && descendantId.startsWith(childId))
// }

export function getId(node: Node): Id | undefined {
  return (node as any).__$node$_$id$__
}

/**
 * User could choose to put ids only to certain nodes and don't use install at all which name all AST's nodes
 */
export function setId(node: Node, id: Id): void {
  (node as any).__$node$_$id$__ = id
}

export function getIdOrThrow(node: Node): Id {
  if (!getId(node)) {
    throw new Error(`Expected node ${getKindName(node)} to have an Id`)
  }
  return getId(node)!
}

// export function getParentId(node: Node): Id | undefined {
//   throw new Error('Not implemented')
// }

/**
 *  when user modify the ast by removing nodes he is responsible of calling uninstall on a parent of the AST
 *  that changed
 */
export function uninstall(node: Node) {
  throw new Error('Not implemented')
}

export type Id = string



