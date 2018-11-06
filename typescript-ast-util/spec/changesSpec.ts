import * as ts from "typescript";
import { compileProject, createProgram } from "../src";
import { diffAndCreateTextChanges, getTextFromFormattingEdits } from '../src/changes';
import {Project, FileTextChanges, TextChange} from 'ts-simple-ast'

describe('diffAndCreateTextChanges', () => {
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
  xit('diffAndCreateTextChanges single line', () => {
    test('hello', 'hi world')
  })

  it('diffAndCreateTextChanges second', () => {
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

  const s2 = `function f(a, b, c, foo) {
  let nameMePlease: boolean = a > 3 * foo.bar.alf && b < c
  function asdasd() {
  }
  if (a < b)
    return nameMePlease;
}
`
  const s1 = `function f(a, b, c, foo) {
  function asdasd() {
  }
  if (a < b)
    return a > 3 * foo.bar.alf && b < c
}
`

  it('diffAndCreateTextChanges', () => {
test(s1,s2)
  })


  it('diffAndCreateTextChanges using sourcefiles tsa', () => {

const project = new Project({useVirtualFileSystem: true})
const file = project.createSourceFile('f1.ts', s1)
file.applyTextChanges(
  diffAndCreateTextChanges(s1, s2).map(c=>new (TextChange as any)(c))
    )

    expect(file.getText()).toBe(s2)
    
  })
})