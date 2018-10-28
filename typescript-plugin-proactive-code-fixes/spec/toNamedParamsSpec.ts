
import { toNamedParameters } from '../src/code-fix/toNamedParams';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo } from './testUtil';

describe('toNamedParams', () => {

  it('basic', async () => {
    const code = `
function foo33(a: string[][], b: {o: {u: Date[]}}, c: number=4) : Date {
  throw 'dummy'
}
`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('ing[][], b'), toNamedParameters.name)
    expect(removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')).toContain(`interface Foo33 { a: string[][]; b: {o: {u: Date[]}}; c: number; }`)
//  console.log(result.edits[0].textChanges.map(t=>t.newText));
 
    expect(removeWhiteSpaces(result.edits[0].textChanges[1].newText, ' ')).toContain(`{a, b, c = 4}: Foo33`)
 
  })

  it('with previous statement', async () => {
    const code = `
var a = 1
function foo33(a: string[][], b: {o: {u: Date[]}}, c: number=4) : Date {
  throw 'dummy'
}
`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('ing[][], b'), toNamedParameters.name)
    expect(removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')).toContain(`interface Foo33 { a: string[][]; b: {o: {u: Date[]}}; c: number; }`)
//  console.log(result.edits[0].textChanges.map(t=>t.newText));
 
    expect(removeWhiteSpaces(result.edits[0].textChanges[1].newText, ' ')).toContain(`{a, b, c = 4}: Foo33`)
 
  })

})

