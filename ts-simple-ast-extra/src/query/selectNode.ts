import { Node } from 'ts-morph'
import { getChildrenForEachChild } from '../node'
import { AstPath, SelectOptions } from './types'
/**
 * inverse operation than buildAstPath, it will loop up for a node in a sourceFile given a path
 * @param path
 * @param rootNode
 */
export function selectNode<T extends Node>(astPath: AstPath, rootNode: Node, options?: SelectOptions): T | undefined {
  let n: Node = rootNode
  let c: Node | undefined
  //  let pathNodes =  path.split('/').filter(a=>a)
  //  .map(i=>parseInt(i))
  let { path } = astPath
  const tail = path.slice(1, path.length)
  ;[...tail, path[0]].forEach(pathNode => {
    const children = getChildrenForEachChild(n)
    c = children[pathNode.index]
    n = c
  })
  return n as T
}
