const code = `
const variableString1 = 'hello world1'
const variableString2 = "hello world2"
`
import { stringChangeQuoteChar } from '../src/code-fix/stringChangeQuoteChar';
import { testCodeFixRefactorEditInfo } from './testUtil';
describe('stringChangeQuoteChar', () => {
  it('simple2double', async () => {
    const result = testCodeFixRefactorEditInfo(code, code.indexOf(`'hello world1'`)+1, stringChangeQuoteChar.name)
    expect(result.edits[0].textChanges[0].newText).toBe('"hello world1"')
  })
  it('double2simple', async () => {
    const result = testCodeFixRefactorEditInfo(code, code.indexOf(`"hello world2"`)+1, stringChangeQuoteChar.name)
    expect(result.edits[0].textChanges[0].newText).toBe(`'hello world2'`)
  })
})

