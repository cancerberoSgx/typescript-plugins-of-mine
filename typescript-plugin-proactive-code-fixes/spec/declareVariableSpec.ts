import * as shell from 'shelljs';
import  Project, { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { codeFixes, CodeFixOptions } from '../src/codeFixes';
import { defaultBeforeEach } from './testUtil';

describe('tests', () => {
  let simpleProject: Project
  let program: ts.Program
  const projectPath = `assets/sampleProject1_1_copy`;
  const log = (msg)=>{};//console.log

  beforeEach(() => {
    const result  = defaultBeforeEach({projectPath});
    program = result.program
    simpleProject = result.simpleProject
  });

  it('Declare variable fix', async () => {
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const cursorPosition = 61
    const diagnostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    if (!diagnostics || !diagnostics.length) {
      return fail();
    }
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program, sourceFile: sourceFile.compilerNode }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(arg);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain('const i=f()')
  })
});
