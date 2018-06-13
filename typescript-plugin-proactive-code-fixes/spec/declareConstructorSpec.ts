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

  it('Declare constructor fix when target kind is child.parent.kind === ts.SyntaxKind.NewExpression', () => {
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const cursorPosition = 137
    const diagnostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    if (!diagnostics || !diagnostics.length) {
      return fail('no diagnostics found');
    }
    const newExprChild = sourceFile.getDescendantsOfKind(ts.SyntaxKind.NewExpression)
    if (!newExprChild || !newExprChild.length) {
      return fail('new new expression found')
    }
    const child = newExprChild[0]
    if (!TypeGuards.isNewExpression(child)) {
      return fail('is not newexpr type guard')
    }
    const arg: CodeFixOptions = {
      diagnostics,
      containingTarget: child.compilerNode,
      containingTargetLight: child.compilerNode,
      log,
      simpleNode: child,
      program,
      sourceFile: sourceFile.compilerNode
    }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail('no fixes for knowndiagnostic');
    }
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).not.toContain(`public constructor(aString: String) {`)
    fixes[0].apply(arg);
    simpleProject.saveSync();
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain(`public constructor(aString: String) {`)
  })

});
