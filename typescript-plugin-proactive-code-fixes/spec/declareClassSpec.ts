

import { declareClass } from '../src/code-fix/declareClass';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo } from './testUtil';

describe('declareClass', () => {
  it('Declare class when extending non existent', () => {
    const code = `
class C extends NonExistentClass implements NonExistentInterface, ExistentInterface{

}

class ExistentInterface{

}`

    const result = testCodeFixRefactorEditInfo(code, code.indexOf('NonExistentClass') + 1, declareClass.name)
    expect(removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')).toContain(`class NonExistentClass { }`)

  })


  it('declare interface', async () => {
    const code = `
class CCC implements III {
  a(): void{}
}
`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('III') + 1, declareClass.name)
    expect(removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')).toContain(`interface III { }`)
  })


  // let uuu: SSSSS = {}
});
