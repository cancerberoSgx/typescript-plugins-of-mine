import { Node, SourceFile, TypeGuards } from 'ts-morph';
import { getChildrenForEachChild } from '../node';

/**
 * creates a selector like `0/4/3/` where numbers are the child index of the node on that level with respect to the parent (getChildIndex()), starting from the sourceFile
 */
export function buildAstSelector(n: Node): AstPath {
  let s=''
  n.getAncestors().reverse().forEach((a, i)=>{
    const index = a.getParent()?getChildrenForEachChild(a.getParent()).findIndex(c=>c===a) : 0
    s+=`${index}/`
  })
  return s
}

interface PathPoint { 
  index: number
  kind: string
  parentKind: string
}
export type AstPath = string

/**
 * inverse operation than buildAstPath, it will loop up for a node in a sourceFile given a path
 * @param s 
 * @param f 
 */
export function selectFromAst<T extends Node>(s: AstPath, f: SourceFile): T|undefined {
  let n: Node=f, c: Node//=f
 let nums =  s.split('/').filter(a=>a)
 .map(i=>parseInt(i))
 const tail = nums.slice(1, nums.length)
 nums = [...tail, nums[0]]
  nums
  .forEach((i, index)=>{
    const children = getChildrenForEachChild(n)
    c = children[i]
      n=c 
  })
  return n as any
}





// export function pathUp(options: {parent: Node, child: Node, indexMode: 'childGetChildIndex'|'getChildrenIndex'|'forEachChildIndex'}) {
//   const a: PathPoint[] = []
//   if(!options.child.getAncestors().find(a=>a===options.parent)){
//     throw `children needs to be descendant of parent`
//   }
//   let n: Node=options.child
//   do{
//     n=
//     a.push({
//       index: n.getParent() ? options.indexMode==='childGetChildIndex' ? n.getChildIndex()n.getChildIndex()  : 
//     })
//   }
//   while((n))
// }