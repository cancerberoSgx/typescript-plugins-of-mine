// import * as ts from 'typescript';
// import { getKindName } from './types';
// import { SourceFile, Node, TextRange } from 'ts-morph';

// /**
//  * Same as [[findSmallestDescendantContainingRange]] but nto so strict r.pos <= n.start <=  r.end <= n.end.
//  */
// export function findChildContainingRangeLight(sourceFile: SourceFile, r: TextRange): Node | undefined {
//   function find(node: Node): Node | undefined {
//     if (r.getPos() >= node.getStart() && r.getEnd() <= node.getEnd()) {
//       return node.forEachChild(find) || node
//     }
//   }
//   return find(sourceFile)
// }

// /**
//  * Given a positionOrRange (common when developing LanguageServicePlugins) it will return en equivalent Range.
//  *
//  */
// function positionOrRangeToRange(positionOrRange: number | ts.TextRange): ts.TextRange {
//   return typeof positionOrRange === 'number'
//     ? { pos: positionOrRange, end: positionOrRange }
//     : positionOrRange
// }

// /**
//  * Given a positionOrRange (common when developing LanguageServicePlugins) it will return en equivalent
//  * number.
//  */
// function positionOrRangeToNumber(positionOrRange: number | ts.TextRange): number {
//   return typeof positionOrRange === 'number' ?
//     positionOrRange :
//     (positionOrRange as ts.TextRange).pos
// }

// export function findDescendantContainingPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
//   function find(node: ts.Node): ts.Node | undefined {
//     if (position >= node.getStart() && position < node.getEnd()) {
//       return ts.forEachChild(node, find) || node
//     }
//   }
//   return find(sourceFile)
// }

// export function findDescendantContainingRange(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
//   function find(node: ts.Node): ts.Node | undefined {
//     if (r.pos >= node.getStart() && r.end < node.getEnd()) {
//       return ts.forEachChild(node, find) || node
//     }
//   }
//   return find(sourceFile)
// }

// export function findChildContainingRangeGetChildren(parent: ts.Node, r: ts.TextRange): ts.Node | undefined {
//   let found: ts.Node = parent.getChildren().find(node => r.pos >= node.getFullStart() && r.end <= node.getEnd())
//   return found && findChildContainingRangeGetChildren(found, r) || parent
// }

// export function findDescendantContainedIn(sourceFile: SourceFile, r: TextRange): Node | undefined {
//   function find(node: Node): ts.Node | undefined {
//     if (r.getPos() <= node.getStart() && r.getEnd() >= node.getEnd()) {
//       return node
//     }
//     else {
//       return ts.forEachChild(node, find)
//     }

//   }
//   return find(sourceFile)
// }

// export const findFirstDescendantContainedInRange = findDescendantContainedIn
//
// /**
//  * Given a positionOrRange and a info context there is a node that is minimal and contains it
//  * (ChildContainingPosition). This method return the parent of that node that comply with given predicate
//  * @param info
//  * @param fileName
//  * @param positionOrRange
//  * @param predicate
//  */
// export function findParentFromPosition(
//   sourceFile: ts.SourceFile | undefined,
//   positionOrRange: number | ts.TextRange,
//   predicate: (node: ts.Node) => boolean)
//   : ts.Node | undefined {
//   if (!sourceFile) {
//     return
//   }
//   const nodeAtCursor = findChildContainingPosition(sourceFile, positionOrRangeToNumber(positionOrRange))
//   if (!nodeAtCursor) {
//     return
//   }
//   const targetNode = findAscendant(nodeAtCursor, predicate, true)
//   return targetNode || undefined
// }
