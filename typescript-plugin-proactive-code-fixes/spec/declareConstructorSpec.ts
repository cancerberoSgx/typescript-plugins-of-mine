import { applyTextChanges } from 'ts-morph-extra';
import { codeFixCreateConstructor } from '../src/code-fix/declareConstructor';
import { removeWhiteSpaces,testCodeFixRefactorEditInfo } from './testUtil';

describe('declareConstructor', () => {

  it('Declare constructor fix when target kind is child.parent.kind === ts.SyntaxKind.NewExpression', () => {

    const code = `
class A{

}
function main(){
  const a = new A("12")
}
`
    const result = testCodeFixRefactorEditInfo(code, code.indexOf('new A') + 4, codeFixCreateConstructor.name)
    const s = removeWhiteSpaces(result.edits[0].textChanges[0].newText, ' ')
    expect(s).toContain(`public constructor(aString0: string) { throw new Error('Not implemented'); }`)
    const output = applyTextChanges(code, result.edits[0].textChanges )
    expect(removeWhiteSpaces(output , ' ')).toBe(`class A{ public constructor(aString0: string) { throw new Error('Not implemented'); } } function main(){ const a = new A("12") } `)
  })
});
