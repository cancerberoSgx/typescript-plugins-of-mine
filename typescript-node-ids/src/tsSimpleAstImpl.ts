import {  Node, TypeGuards } from 'ts-simple-ast'
import { NodeIds } from '.';
import { visitChildrenRecursiveDeepFirst, getChildrenForEachChild } from 'ts-simple-ast-extra';

// export namespace TsSimpleAst {


export type TsSimpleAstId = string

export class TsSimpleAstImpl implements NodeIds<Node, TsSimpleAstId> {
  /**
   * Installs ids on each descendants of given node. Use `this.getId` on any node to obtain a node's id or
   * `getNodeById` to query a node from a parent one using its id. 
   *
   * In general users will provide a SourceFile so the entire AST Nodes filled with ids, but it could also pass
   * a fragment hierarchy, for example, to be faster in case only that fragment is invalidated / modified (see
   * uninstall method)
   * 
   * If given node's parent doesn't' have an id, the whole source file containing given node will be used as parent.
   * 
   */
  install(node: Node): Node {
    let startingId: TsSimpleAstId | undefined
    if (TypeGuards.isSourceFile(node)) {
      startingId = '0'
    }
    else if (node.getParent() && this.getId(node.getParent()!)) {
      startingId = this.getId(node.getParent()!)!
    }
    else {
      // installing ids on whole source tree since given node's parent doesn't have id
      node = node.getSourceFile()
      startingId = '0'
    }
    this.setId(node, startingId)
    
    visitChildrenRecursiveDeepFirst(node, (child: Node, index) => 
      this.setId(child, `${child.getParent() ? this.getId(child.getParent()!) : '0'}.${index}`)
    )
    return node
  }

  /**
   * User could choose to put ids only to certain nodes and don't use install at all which name all AST's nodes
   */
  setId(node: Node, id: TsSimpleAstId): void {
    (node as any).__$node$_$id$__ = id
  }

  /**
   * Returns given node's id or throws exception if node has't one
   */
  getIdOrThrow(node: Node): TsSimpleAstId {
    if (!this.getId(node)) {
      throw new Error(`Expected node ${node.getKindName()} to have an Id`)
    }
    return this.getId(node)!
  }

  /**
   * Returns given node's id or undefined if it hasn't one
   */
  getId(node: Node): TsSimpleAstId | undefined {
    return (node as any).__$node$_$id$__
  }

  /**
   * removes given node's id and returns it.
   */
  deleteId(node: Node): TsSimpleAstId | undefined {
    const id = (node as any).__$node$_$id$__
    delete (node as any).__$node$_$id$__
    return id
  }

  /**
   * Remove given node and all its descendants ids. 
   * 
   * This could be useful when user modify the ast and wants to invalidate that AST so further getNodeById calls won't find anything
   */
  uninstall(node: Node) {
    node.forEachDescendant(c => this.deleteId(c))
    // visitChildrenRecursiveDeepFirst(node, c => (this.deleteId(c), undefined))
    // throw new Error('Not implemented')
  }


  /**
   * Return the first descendant of given parent node with given id or undefined if none is found
   */
  getNodeById(parent: Node, id: TsSimpleAstId): Node | undefined {
    // TODO very very slow implementation we should use next getChildMatchingId declaration or similar - get indexes and kinds from ids, never iterate1
    // return visitChildrenRecursiveDeepFirst(parent, child => this.getId(child) === id ? child : undefined, undefined, undefined, true)
    return parent.getFirstDescendant(child => this.getId(child) === id)
    // return parent.getDescendants().find(child => this.getId(child) === id)
  }

  // function getChildMatchingId(parent: Node, id: Id): Node | undefined {
  //   const parentId = this.getId(parent)
  //   if (!parentId) { // this could be the case user didn't use install and just setId to some nodes , see `setId`
  //     return findChild(parent, child => this.getId(child)===id, true)
  //   }
  //   let firstDotIndex: number
  //   if ((firstDotIndex = parentId.indexOf('.')) !== -1) {
  //     //no dot means it doesn't have children
  //     return undefined
  //   }
  //   const descendantId = parentId.substring(firstDotIndex + 1, parentId.length)
  //   let childId: string | undefined
  //   // TODO: parse id get index / kind and go directly to the right child instead of iterate 
  //   return findChild(parent, child => !!(childId = this.getId(child)) && descendantId.startsWith(childId))
  // }
  // }
}

// export TsSimpleAst

export function createTsSimpleAstImpl(): TsSimpleAstImpl {
  return new TsSimpleAstImpl()
}

export const tsSimpleAstImpl = createTsSimpleAstImpl()