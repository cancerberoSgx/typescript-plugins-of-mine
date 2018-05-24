import { positionOrRangeToRange, positionOrRangeToNumber, dumpAst, findChildContainingRange, findChildContainingPosition, getDiagnosticsInCurrentLocation, getKindName } from "typescript-ast-util";
import { Node } from "ts-simple-ast";

export interface EvalContextUtil {
  /** will dump a pretty recursive structure of given node's descendants */
  printAst(node: Node | ts.Node): string
  positionOrRangeToRange: typeof positionOrRangeToRange
  positionOrRangeToNumber: typeof positionOrRangeToNumber
  findChildContainingRange: typeof findChildContainingRange
  nodeAtCursor: typeof findChildContainingPosition
  getDiagnosticsInCurrentLocation: typeof getDiagnosticsInCurrentLocation
  findChildContainingPosition: typeof findChildContainingPosition
  getKindName: typeof getKindName
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
}