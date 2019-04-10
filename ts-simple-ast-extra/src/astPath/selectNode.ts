import { Node } from 'ts-morph'
import { getChildrenForEachChild, getChildrenByPassSyntaxList } from '../node'
import { AstPath, SelectOptions } from './types'
/**
 * Will select a node from given AstPath. Will look up from rootNode will loop up for a node in a
 * SourceFile given a path.
 * @param path the AstPath used to select the node previously built using `buildAstPath`
 * @param rootNode ancestor node from where to select, previously used to build astPath with `buildAstPath`
 */
export function selectNode<T extends Node>(astPath: AstPath, rootNode: Node, options?: SelectOptions): T | undefined {
  let n: Node = rootNode
  let c: Node | undefined
  let { path } = astPath
  const tail = path.slice(1, path.length)
  ;[...tail].forEach(pathNode => {
    const children =
      astPath.createOptions.mode === 'getChildren' ? getChildrenByPassSyntaxList(n) : getChildrenForEachChild(n)
    c = children[pathNode.index]
    n = c
  })
  return n as T
}
