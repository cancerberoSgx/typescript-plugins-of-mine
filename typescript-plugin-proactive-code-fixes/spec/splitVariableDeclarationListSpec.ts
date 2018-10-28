import { splitVariableDeclarationList } from '../src/code-fix/splitVariableDeclarationList';
import { removeWhiteSpaces, testCodeFixRefactorEditInfo } from './testUtil';

fdescribe('splitVariableDeclarationList', () => {
  it('add types', async () => {
    const code = `let i = 0, c = 's', arr = []`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('i = 0'), splitVariableDeclarationList.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`let i: number = 0; let c: string = 's'; let arr: any[] = [];`)
  })
  it('respect types', async () => {
    const code = `const i: Number = 0, c: String = 's', arr: boolean[] = []`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('er = 0, c: Str'), splitVariableDeclarationList.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`const i: Number = 0; const c: String = 's'; const arr: boolean[] = [];`)
  })
})

