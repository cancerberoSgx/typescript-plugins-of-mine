import * as ts from 'typescript';
import { getKindName } from './types';
import { findAscendant } from './node';
// position & range helpers
/** given a positionOrRange (common when developing LanguageServicePlugins) it will return en equivalent Range  */
export function positionOrRangeToRange(positionOrRange: number | ts.TextRange): ts.TextRange {
  return typeof positionOrRange === 'number'
    ? { pos: positionOrRange, end: positionOrRange }
    : positionOrRange
}
/** given a positionOrRange (common when developing LanguageServicePlugins) it will return en equivalent number  */
export function positionOrRangeToNumber(positionOrRange: number | ts.TextRange): number {
  return typeof positionOrRange === 'number' ?
    positionOrRange :
    (positionOrRange as ts.TextRange).pos
}

// node accessors and guards


/** Gets the JSDoc of any node. For performance reasons this function should only be called when `canHaveJsDoc` return true. */
export function getJsDoc(node: ts.Node, sourceFile?: ts.SourceFile): ts.JSDoc[] {
  const result = [];
  for (const child of node.getChildren(sourceFile)) {
    if (child.kind !== ts.SyntaxKind.JSDocComment)
      break;
    result.push(child)
  }
  return result as ts.JSDoc[]
}
export function isDeclaration(node: ts.Node): boolean {
  return getKindName(node.kind).endsWith('Declaration')
}
export function hasName(node: ts.Node): boolean {
  return !!(node as ts.NamedDeclaration).name
}

// get node by position or range helpers


export function findChildContainingPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart() && position < node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}

//TODO rename to findLowestChildContainingRange
export function findChildContainingRange(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (r.pos >= node.getStart() && r.end < node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}
// same as findChildContainingRange but nto so strict r.pos <= n.start <=  r.end <= n.end
export function findChildContainingRangeLight(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (r.pos >= node.getStart() && r.end <= node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}
export function findChildContainingRangeGetChildren(parent: ts.Node, r: ts.TextRange): ts.Node | undefined {
  // let found:ts.Node = parent
  let found: ts.Node = parent.getChildren().find(node => r.pos >= node.getFullStart() && r.end <= node.getEnd())
  return found && findChildContainingRangeGetChildren(found, r) || parent
}

//TODO. rename to findFirstChildContainedRange
export function findChildContainedRange(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (r.pos <= node.getStart() && r.end >= node.getEnd()) {
      return node
    }
    else {
      return ts.forEachChild(node, find)
    }

  }
  return find(sourceFile)
}
/**
 * Given a positionOrRange and a info context there is a node that is minimal and contains it (ChildContainingPosition). This method return the parent of that node that comply with given predicate
 * @param info 
 * @param fileName 
 * @param positionOrRange 
 * @param predicate 
 */
export function findParentFromPosition(
  sourceFile: ts.SourceFile | undefined,
  positionOrRange: number | ts.TextRange,
  predicate: (node: ts.Node) => boolean)
  : ts.Node | undefined {
  // const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return
  }
  const nodeAtCursor = findChildContainingPosition(sourceFile, positionOrRangeToNumber(positionOrRange))
  if (!nodeAtCursor) {
    return
  }
  const targetNode = findAscendant(nodeAtCursor, predicate, true)
  return targetNode || undefined
}



