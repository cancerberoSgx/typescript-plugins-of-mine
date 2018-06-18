
function fofofofo1(date1: Date[][], n: number): Promise<Boolean>{ 
  return Promise.resolve(true)
}

function fofofofo(date1: Date[][], n: number ): Promise<Boolean>{
  return Promise.resolve(true)
}

interface Interface1 {
  method2:  (a: number, b: Date[], c: boolean )  => string   
}
const obj: Interface1 = {
  method2(c: boolean, b: Date[], a: number): string { 
  /* &%&% reorderParams("method2", [2, 1, 0]) */
     
    return ''
  }
}

class C123 {
  method1(a: number, b: boolean[][], d: Date): number[] {
    return []
  }
}




import { TypeGuards, QuoteKind } from 'ts-simple-ast';
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { findChildContainingRangeLight, positionOrRangeToRange, findChildContainedRange, findChildContainingRangeGetChildren, getKindName } from 'typescript-ast-util';
import * as ts from 'typescript'
declare const c: EvalContext;

function eval1(){
  const position = 151
  const sourceFile = c.info.languageService.getProgram().getSourceFile(c.fileName)
  // const target = findChildContainingRangeLight(sourceFile, positionOrRangeToRange(position))
  const target = findChildContainingRangeGetChildren(sourceFile, positionOrRangeToRange(position))
  c.print(getKindName(target)+ target.getFullText() + target.getLeadingTriviaWidth() + ' - ' + getLeadingTrivia(target)+' - '+
  ts.getSyntheticLeadingComments(target).map(c=>c.text).join(', '))

function getLeadingTrivia(target){
  return target.getFullText().substring(0, target.getLeadingTriviaWidth())
}
  // const thisSourceFile = c.project.getSourceFile(c.fileName)
  // consts node = thisSourceFile.getDescendantAtPos(position)
}