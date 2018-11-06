import { SyntaxKind } from "typescript";
import {  } from "../src";
import { diffAndCreateTextChanges, getTextFromFormattingEdits } from '../src/changes';

describe('changes', () => {
  function test(s1: string, s2: string){

    const changes = 
  //    [
  //      {newText: '', span: { start: 12, length: 15 } },
  //   { newText: '', span: { start: 27, length: 12 } },
  //   { newText: 'function g(){\n', span: { start: 39, length: 0 } },
  //   { newText: '  const vv = a>b\n',   span: { start: 39, length: 0 } },
  //   { newText: '  if(vv){}\n', span: { start: 39, length: 0 } }
  // ]
  // .reverse()
    diffAndCreateTextChanges(s1, s2)
    // console.log(changes);
    
    const result = getTextFromFormattingEdits(s1, changes)
    expect(result).toBe(s2)
  }
  it('diffAndCreateTextChanges', () => {
    // test('hello', 'hi world')
    test(
`const c = 1
function f (){
  if(a>b){}
}
`, 
`const c = 1
function g(){
  const vv = a>b
  if(vv){}
}
`)
  })
})