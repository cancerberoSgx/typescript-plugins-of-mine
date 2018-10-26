import * as shell from 'shelljs';
import Project, {ts, Expression, TypeGuards} from 'ts-simple-ast';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { codeFixes, CodeFixOptions } from '../src/codeFixes';
import { defaultBeforeEach, defaultLog } from './testUtil';
import { codeFixCreateVariable } from '../src/code-fix/declareVariable';

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
    fixes[0].apply(arg);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain('const i=f()')
  })

  it('declare function fix should declare function with correct para types and return type', () => {
    const project = new Project({ useVirtualFileSystem: true })
    const sourceFile = project.createSourceFile('foo.ts', `const a: number = nonexistent(1.23, /[a-z]+/i, 'hello', [false])`)
    const cursorPosition = 20
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
    fix.apply(arg)
    expect(project.getSourceFile('foo.ts').getText()).toContain('function nonexistent(arg0: Number')
  })
})



