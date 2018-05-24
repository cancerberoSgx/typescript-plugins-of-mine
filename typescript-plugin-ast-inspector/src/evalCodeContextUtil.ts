import { positionOrRangeToRange, positionOrRangeToNumber, dumpAst, findChildContainingRange, findChildContainingPosition, getDiagnosticsInCurrentLocation, getKindName, findAscendant, filterChildren } from "typescript-ast-util";
import { Node } from "ts-simple-ast";
/** Utilities that easy working with native TypeScript AST Nodes */
export interface EvalContextUtil {
  /** pretty-prints AST structure of given node's descendants */
  printAst(node: Node | ts.Node): string
  positionOrRangeToRange: typeof positionOrRangeToRange
  positionOrRangeToNumber: typeof positionOrRangeToNumber
  findChildContainingRange: typeof findChildContainingRange
  nodeAtCursor: typeof findChildContainingPosition
  getDiagnosticsInCurrentLocation: typeof getDiagnosticsInCurrentLocation
  findChildContainingPosition: typeof findChildContainingPosition
  getKindName: typeof getKindName
  findAscendant: typeof findAscendant
  filterChildren: typeof filterChildren
}
export class EvalContextUtilImpl implements EvalContextUtil {
  printAst(node: Node | ts.Node): string {
    return dumpAst((node as any).compilerNode || node)
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
}