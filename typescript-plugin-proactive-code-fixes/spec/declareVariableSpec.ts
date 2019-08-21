import Project from 'ts-morph';
import { codeFixCreateVariable } from '../src/code-fix/declareVariable';
import { defaultBeforeEach, testCodeFixRefactorEditInfo } from './testUtil';

describe('tests', () => {
  let simpleProject: Project
  const projectPath = `assets/sampleProject1_1_copy`;

  beforeEach(() => {
    const result = defaultBeforeEach({ projectPath });
    simpleProject = result.simpleProject
  });

  it('Declare variable fix', async () => {
    const code = `nonexistent=1`
    const cursorPosition = 2
    const result = testCodeFixRefactorEditInfo(code, cursorPosition, codeFixCreateVariable.name)
    // console.log(result.edits[0].textChanges[0]);
    expect(result.edits[0].textChanges[0].newText).toBe('let ')
  })


  it('Declare variable fix', async () => {
    const code = `
function foo(a:number){}
foo(nonexistent+1)
`
    const cursorPosition = code.indexOf('nonexistent')+1
    const result = testCodeFixRefactorEditInfo(code, cursorPosition, codeFixCreateVariable.name)
    expect(result.edits[0].textChanges[0].newText).toBe('let nonexistent;\n')
  })

  it('declare function fix should declare function with correct params types and return type', () => {
    const code = `const a: number = nonexistent(1.23, /[a-z]+/i, 'hello', [false])`
    const cursorPosition = code.indexOf('nonexistent(') + 2
    const result = testCodeFixRefactorEditInfo(code, cursorPosition, codeFixCreateVariable.name)
    expect(result.edits[0].textChanges[0].newText.includes('function nonexistent('))
    expect(result.edits[0].textChanges[0].newText.includes('): number {'))
    expect(result.edits[0].textChanges[0].newText.includes('arg0: number'))
    expect(result.edits[0].textChanges[0].newText.includes('arg1: RegExp'))
    expect(result.edits[0].textChanges[0].newText.includes('arg2: string'))
    expect(result.edits[0].textChanges[0].newText.includes('arg3: boolean[]'))
  })


  it('declare function fix should declare function starting statemtn', () => {
    const code = `foo(1)`
    const cursorPosition = code.indexOf('foo(') + 2
    const result = testCodeFixRefactorEditInfo(code, cursorPosition, codeFixCreateVariable.name)
    expect(result.edits[0].textChanges[0].newText).toContain('function foo(arg0: number): any {')
    // console.log(result.edits[0].textChanges[0]);
  })


})
