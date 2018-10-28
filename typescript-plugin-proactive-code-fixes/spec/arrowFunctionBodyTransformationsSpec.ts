import { arrowFunctionBodyTransformations } from '../src/code-fix/arrowFunctionTransformations';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo } from './testUtil';

describe('arrowFunctionBodyTransformations', () => {

  const code = `
const o = {
  fn: o1 => 'hello' + o1,
  bodied: a => { return a - 1 + 2 / 6; },
  zeroArg: () => foo(),
  returningObjectLiteral: <T>(a) => ({ a, b: 'hi' })
}
`
  it('add body single arg no parenth', async () => {
    const result = testCodeFixRefactorEditInfo(code, code.indexOf(`=> 'hello'`), arrowFunctionBodyTransformations.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`return 'hello' + o1`)
  })

  it('remove body ', async () => {
    const result = testCodeFixRefactorEditInfo(code, code.indexOf(`a => { return a - 1 + 2`), arrowFunctionBodyTransformations.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain('a => a - 1 + 2 / 6')
  })
  it('add body returning object literal', async () => {
    const result = testCodeFixRefactorEditInfo(code, code.indexOf(`=> ({ a, b: 'hi' })`), arrowFunctionBodyTransformations.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`=> { return { a, b: 'hi' }; }`)
  })
})
