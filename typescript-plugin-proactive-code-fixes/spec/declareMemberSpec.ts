import { declareMember } from '../src/code-fix/declareMember';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo, testCodeFixRefactorEditInfo2 } from './testUtil';
import Project, { TypeGuards, Identifier } from 'ts-simple-ast';
import { applyTextChanges } from 'ts-simple-ast-extra';

describe('declareMember', () => {

  it('add missing method to object literal', () => {
    const code = `
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar123123(1, ['w'], true) 
`
    const result= testCodeFixRefactorEditInfo(code, code.indexOf('bar123123(1') + 1, declareMember.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`, bar123123(arg0: number, arg1: string[], arg2: boolean): string[] { throw new Error('Not Implemented') }`)
    const output = applyTextChanges(code, result.edits[0].textChanges )
    expect(removeWhiteSpaces(output , ' ')).toBe(`const o = { foo: () => { return 1 } , bar123123(arg0: number, arg1: string[], arg2: boolean): string[] { throw new Error('Not Implemented') } } const val: string[] = o.bar123123(1, ['w'], true) `)
  })

  it('add missing prop to object literal', () => {
    const code = `
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar
`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('o.bar') + 3, declareMember.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`, bar: null`) // TODO: should be : string[]

    const output = applyTextChanges(code, result.edits[0].textChanges )
    expect(removeWhiteSpaces(output , ' ')).toBe(`const o = { foo: () => { return 1 } , bar: null } const val: string[] = o.bar `)
  })

  it('add missing method to object\'s interface', async () => {
    const code = `
interface Hello {
  foo():void
}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])    
    `
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('hello.world(') + 6, declareMember.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    // console.log(s);
    expect(s).not.toContain(`, world(arg0: number[][]): any;`)
    expect(s).toContain(`world(arg0: number[][]): any;`)
    // expect(result.edits[0].textChanges[0].span.start).toBeCloseTo(code.indexOf('interface Hello {')+'interface Hello {'.length, 2)

    const output = applyTextChanges(code, result.edits[0].textChanges )
    expect(removeWhiteSpaces(output , ' ')).toBe(`interface Hello { foo():void world(arg0: number[][]): any; } const hello: Hello = {} let i: string[] i = hello.world([[1, 2, 3], [4, 5]]) `)
  })


  it('add missing method to object\'s interface 2', async () => {
    const code = `
interface Hello {}
const hello: Hello = {}
const k = hello.mama(1, 2, 3) + ' how are you?'
    `
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('hello.mama(') + 6, declareMember.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    // console.log(s);
    expect(s).not.toContain(`, mama(arg0: number, arg1: number, arg2: number): string`)
    expect(s).toContain(`mama(arg0: number, arg1: number, arg2: number): string`)

    const output = applyTextChanges(code, result.edits[0].textChanges )
    expect(removeWhiteSpaces(output , ' ')).toBe(`interface Hello { mama(arg0: number, arg1: number, arg2: number): string; } const hello: Hello = {} const k = hello.mama(1, 2, 3) + ' how are you?' `)
  })


  it('add missing method to new expression class', async () => {
    const code = `  
class CCC{

}
new CCC().fooo([1])
    `
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('.fooo([1])') + 3, declareMember.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    // console.log(result.edits[0].textChanges[0]);
    // expect(s).not.toContain(`, mama(arg0: number, arg1: number, arg2: number): string`)
    expect(s).toContain(`fooo(arg0: number[]): any { throw new Error('Not Implemented') }`)

    const output = applyTextChanges(code, result.edits[0].textChanges )
    expect(removeWhiteSpaces(output , ' ')).toBe(`class CCC{ fooo(arg0: number[]): any { throw new Error('Not Implemented') } } new CCC().fooo([1]) `)
  })

  xit('add missing member to object in other file', async () => { // TODO: not working
    const project = new Project()
    const file1= project.createSourceFile('src/f1.ts', `
export const obj1 = {a: 1}
`)
    const file2 = project.createSourceFile('src/f2.ts', `
import {obj1} from './f1'; 
obj1.foo(1)
const obj2 = {}
obj2.bar(2)
    `)
    // const obj1 = file2.getFirstDescendant(d=>d.getText()==='obj1'&& TypeGuards.isPropertyAccessExpression(d.getParent()))
    // console.log('TT', obj1.getType().getText(), obj1.getType().getApparentType().getText(), project.getTypeChecker().getTypeAtLocation(obj1).getText());
    
    const result = testCodeFixRefactorEditInfo2(file2, project, file2.getFullText().indexOf('foo(')+1, declareMember.name, true)
    console.log(result);
    
    const result2 = testCodeFixRefactorEditInfo2(file2, project, file2.getFullText().indexOf('bar(')+1, declareMember.name, true)
    console.log(result2);
    // const result = testCodeFixRefactorEditInfo(code, code.indexOf('.fooo([1])') + 3, declareMember.name)
    // const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    // console.log(result.edits[0].textChanges[0]);
    // expect(s).not.toContain(`, mama(arg0: number, arg1: number, arg2: number): string`)
    // expect(s).toContain(`fooo(arg0: number[]): any { throw new Error('Not Implemented') }`)
  })
})
