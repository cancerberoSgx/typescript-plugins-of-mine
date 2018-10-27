import Project from 'ts-simple-ast';
import { RefactorEditInfo } from 'typescript';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { codeFixCreateVariable } from '../src/code-fix/declareVariable';
import { codeFixes, CodeFixOptions } from '../src/codeFixes';
import { defaultBeforeEach, defaultLog } from './testUtil';

describe('tests', () => {
  let simpleProject: Project
  const projectPath = `assets/sampleProject1_1_copy`;

  beforeEach(() => {
    const result = defaultBeforeEach({ projectPath });
    simpleProject = result.simpleProject
  });

  it('Declare variable fix', async () => {
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const cursorPosition = 61
    const diagnostics = getDiagnosticsInCurrentLocation(simpleProject.getProgram().compilerObject, sourceFile.compilerNode, cursorPosition);
    if (!diagnostics || !diagnostics.length) {
      return fail();
    }
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const arg: CodeFixOptions = {
      diagnostics, containingTarget: child.compilerNode,
      containingTargetLight: child.compilerNode, log: defaultLog,
      simpleNode: child, program: simpleProject.getProgram().compilerObject,
      sourceFile: sourceFile.compilerNode
    }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail();
    }
    const result = fixes[0].apply(arg) as RefactorEditInfo
    expect(result.edits[0].textChanges[0].newText.includes('const '))
    expect(result.edits[0].textChanges[0].span.start).toBe(61)
  })

  it('declare function fix should declare function with correct params types and return type', () => {
    const project = new Project({ useVirtualFileSystem: true })
    const code = `const a: number = nonexistent(1.23, /[a-z]+/i, 'hello', [false])`
    const sourceFile = project.createSourceFile('foo.ts', code)
    const cursorPosition = code.indexOf('nonexistent(') + 2
    const diagnostics = getDiagnosticsInCurrentLocation(project.getProgram().compilerObject, sourceFile.compilerNode, cursorPosition);
    expect(diagnostics.find(d => d.code === 2304 && d.messageText.toString().includes('nonexistent'))).toBeDefined()
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const arg: CodeFixOptions = {
      diagnostics,
      containingTarget: child.compilerNode,
      containingTargetLight: child.compilerNode,
      log: defaultLog,
      simpleNode: child,
      simpleProject,
      program: simpleProject.getProgram().compilerObject,
      sourceFile: sourceFile.compilerNode
    }
    const fixes = codeFixes.filter(fix => fix.predicate(arg))
    const fix = fixes.find(f => f.name === codeFixCreateVariable.name)
    if (!fix) {
      return fail('fix predicate not working ' + codeFixCreateVariable.name);
    }
    const result = fix.apply(arg) as RefactorEditInfo

    expect(result.edits[0].textChanges[0].newText.includes('function nonexistent('))
    expect(result.edits[0].textChanges[0].newText.includes('): number {'))
    expect(result.edits[0].textChanges[0].newText.includes('arg0: number'))
    expect(result.edits[0].textChanges[0].newText.includes('arg1: RegExp'))
    expect(result.edits[0].textChanges[0].newText.includes('arg2: string'))
    expect(result.edits[0].textChanges[0].newText.includes('arg3: boolean[]'))
  })

})
