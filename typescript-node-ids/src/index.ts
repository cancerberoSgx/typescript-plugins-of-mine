export * from './typescriptImpl'

export interface NodeIds<Node, Id>{
/**
 * Installs ids on each descendants of given node. Use `getId` on any node to obtain a node's id or
 * `getNodeById` to query a node from a parent one using its id. 
 *
 * In general users will provide a SourceFile so the entire AST Nodes filled with ids, but it could also pass
 * a fragment hierarchy, for example, to be faster in case only that fragment is invalidated / modified (see
 * uninstall method)
 * 
 * If given node's parent doesn't' have an id, the whole source file containing given node will be used as parent.
 * 
 */
install(node: Node): Node
/**
 * User could choose to put ids only to certain nodes and don't use install at all which name all AST's nodes
 */
setId(node: Node, id: Id): void

/**
 * Returns given node's id or throws exception if node has't one
 */
getIdOrThrow(node: Node): Id

/**
 * Returns given node's id or undefined if it hasn't one
 */
getId(node: Node): Id | undefined 


/**
* removes given node's id and returns it.
*/
deleteId(node: Node): Id | undefined

/**
 * Remove given node and all its descendants ids. 
 * 
 * This could be useful when user modify the ast and wants to invalidate that AST so further getNodeById calls won't find anything
 */
uninstall(node: Node): void

/**
 * Return the first descendant of given parent node with given id or undefined if none is found
 */
getNodeById(parent: Node, id: Id): Node | undefined 


}