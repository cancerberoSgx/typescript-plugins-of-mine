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
    program = result.simpleProject.getProgram().compilerObject
    simpleProject = result.simpleProject
  });

  it('Declare class when extending non existent', () => {
    const filePath = `/src/third.ts`
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(filePath));

    const diagnostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, 19);
    if (!diagnostics || !diagnostics.length) {
      return fail('no diagnostics found');
    }
    const h = sourceFile.getDescendantsOfKind(ts.SyntaxKind.HeritageClause)[0]
    const id = h.getDescendantsOfKind(ts.SyntaxKind.Identifier)[0]
    const arg: CodeFixOptions = { 
      diagnostics, 
      containingTarget: id.compilerNode, 
      containingTargetLight: id.compilerNode, 
      log, program, 
      simpleNode: id,
       sourceFile: sourceFile.compilerNode 
      }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail('no fixes for knowndiagnostic');
    }
    expect(shell.cat(`${projectPath}${filePath}`).toString()).not.toContain(`class NonExistent {`)
    fixes[0].apply(arg);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}${filePath}`).toString()).toContain(`class NonExistent {`)
  })
});
