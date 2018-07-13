import { Node, SourceFile } from 'typescript'
// import * as ts from 'typescript'
// import { Id } from './index'

export type Visitor = (node: Node, level: number, childIndex: number, parentNode: Node) => void

export function visit_forEachChild(node: Node, visitor: Visitor, file: SourceFile, level: number = 0, childIndex: number = 0) {
  if (!node) {
    return
  }
  visitor(node, level, childIndex, node.parent||file)
  let index = 0
  node.forEachChild(child => visit_forEachChild(child, visitor, file, level + 1, index++))
}


// export function getKindName(kind: ts.SyntaxKind) {
//   return (ts as any).SyntaxKind[kind];
// }