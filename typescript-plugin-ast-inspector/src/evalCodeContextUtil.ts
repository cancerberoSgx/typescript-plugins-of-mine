import { positionOrRangeToRange, positionOrRangeToNumber, dumpAst, findChildContainingRange, findChildContainingPosition, getDiagnosticsInCurrentLocation, getKindName, findAscendant, filterChildren, getAscendants, findChild } from "typescript-ast-util";
import * as ts from 'typescript';
import { Node } from "ts-simple-ast";
import * as assert from 'assert'

/** Utilities that easy working with native TypeScript AST Nodes */
export interface EvalContextUtil {
  /** pretty-prints AST structure of given node's descendants */
  printAst(node: Node | ts.Node, getChildrenMode?:boolean): string
  positionOrRangeToRange: typeof positionOrRangeToRange
  positionOrRangeToNumber: typeof positionOrRangeToNumber
  findChildContainingRange: typeof findChildContainingRange
  nodeAtCursor: typeof findChildContainingPosition
  getDiagnosticsInCurrentLocation: typeof getDiagnosticsInCurrentLocation
  findChildContainingPosition: typeof findChildContainingPosition
  getKindName: typeof getKindName
  findAscendant: typeof findAscendant
  filterChildren: typeof filterChildren
  getAscendants: typeof getAscendants
  findChild: (n: ts.Node, predicate: (n: ts.Node) => boolean) => ts.Node | undefined
  findDescendants: typeof findChild
  assert: typeof assert
}
export class EvalContextUtilImpl implements EvalContextUtil {
  printAst(node: Node | ts.Node, getChildrenMode:boolean=false): string {
    return dumpAst((node as any).compilerNode || node, getChildrenMode)
  }
  positionOrRangeToRange = positionOrRangeToRange
  positionOrRangeToNumber = positionOrRangeToNumber
  findChildContainingRange = findChildContainingRange
  findChildContainingPosition = findChildContainingPosition
  nodeAtCursor = findChildContainingPosition
  getDiagnosticsInCurrentLocation = getDiagnosticsInCurrentLocation
  getKindName = getKindName
  findAscendant = findAscendant
  filterChildren = filterChildren
  getAscendants = getAscendants
  findChild = (n: ts.Node, predicate: (n: ts.Node) => boolean): ts.Node | undefined => findChild(n, predicate, false)
  findDescendants = findChild
  assert = assert
}

// TODO : Perhaps add these too ?

// const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
// const isNotExpression = node => !isExpression(node)
// const isStatement = node => getKindName(node).endsWith('Statement')
// const isStatementContainer = n => getKindName(n).endsWith('Block') || n.kind === ts.SyntaxKind.SourceFile
// const printNode = node => node ? (getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText().replace(/\s+/g, ' ').substring(0, Math.min(30, node.getText().length))+'...') : 'undefined'
// const printNodes = nodes => nodes.map(printNode).join('\n')
// const dumpNode = node => print(printNode(node))