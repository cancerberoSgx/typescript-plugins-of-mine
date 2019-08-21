import { applyTextChanges } from 'ts-morph-extra';
import { changeReturnType } from '../src/code-fix/changeReturnType';
import { testCodeFixRefactorEditInfo } from './testUtil';

describe('changeReturnType', () => {

  it('should be suggested when a return statement child is selected', () => {
    const code = `
class C {
  m(): number {
    return Math.random()>0.5 ? 's' : /a/g
  }
}
function main(): string{
  return 1 + 1
}
`
    let result = testCodeFixRefactorEditInfo(code, code.indexOf('return 1 + 1') + 4, changeReturnType.name)
    expect(applyTextChanges(code, result.edits[0].textChanges )).toContain('function main(): number{')

    result = testCodeFixRefactorEditInfo(code, code.indexOf( `return Math.random()>0.5 ? 's' : /a/g`) + 4, changeReturnType.name)
    expect(applyTextChanges(code, result.edits[0].textChanges )).toContain('m(): string | RegExp {')

   
  })

  xit('test generic types and more complex types ' , ()=>{

  })
});
