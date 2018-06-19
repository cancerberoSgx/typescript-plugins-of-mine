
function foo(n: number, date1: Date[][]): Promise<Boolean>{ 
  return Promise.resolve(true)
}

function bar(a: number[], n: RegExp ): Promise<Boolean>{
  return Promise.resolve(true)
}

interface Interface1 {
  method2:  (a: number, b: Date[], c: boolean )  => string   
}
const obj: Interface1 = {
  method2  (a: number, b: Date[], c: boolean ) : string {      
    return ''
  }
}

class Air {
  blow(a: number, b: boolean[][], d: Date): number[] {
    return []
  }
}

const result = new Air().blow(3.14, [[true]], new Date())


import { TypeGuards, QuoteKind } from 'ts-simple-ast';
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { findChildContainingRangeLight, positionOrRangeToRange, findChildContainedRange, findChildContainingRangeGetChildren, getKindName } from 'typescript-ast-util';
import * as ts from 'typescript'
declare const c: EvalContext;

function eval1(){
  const position = 151
  const sourceFile = c.info.languageService.getProgram().getSourceFile(c.fileName)

  // c.project.createSource
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