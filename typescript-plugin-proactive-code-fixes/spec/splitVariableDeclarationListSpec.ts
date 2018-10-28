import { splitVariableDeclarationList } from '../src/code-fix/splitVariableDeclarationList';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo } from './testUtil';

describe('splitVariableDeclarationList', () => {
  it('basic', async () => {
    const code = `let i = 0, c = 's', arr = []`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('i = 0'), splitVariableDeclarationList.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`let i: number = 0; let c: string = 's'; let arr: {} = [];`)
  })
})

