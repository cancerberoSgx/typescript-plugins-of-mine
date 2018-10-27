
import { declareReturnType } from '../src/code-fix/declareReturnType';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo } from './testUtil';

describe('declareReturnType', () => {
  it('basic', async () => {
    const code = `
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => msg+'', kill: function <T>() { return 1 } }
}
`
    const cursorPosition = code.indexOf('FNResult<T>') + 1
    const result = testCodeFixRefactorEditInfo(code, cursorPosition, declareReturnType.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`interface FNResult<T> { /** * TODO: Document me */ a: number; /** * TODO: Document me */ b: string; /** * TODO: Document me */ log(msg: any): string; /** * TODO: Document me */ kill<T>(): number; }`)
  })  
})