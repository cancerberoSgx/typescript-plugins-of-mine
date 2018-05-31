import * as shell from 'shelljs'
import Project, { SourceFile, Node, Diagnostic, TypeGuards } from 'ts-simple-ast'
import * as ts from 'typescript'
import { codeFixes, CodeFixOptions } from '../src/codeFixes';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util'

describe('tests', () => {
  let simpleProject: Project, program: ts.Program
  const projectPath = `assets/sampleProject1_1_copy`;
  const log = console.log

  beforeEach(() => {
    shell.rm(`-rf`, projectPath);
    shell.cp(`-r`, `assets/sampleProject1`, `${projectPath}`);
    simpleProject = new Project({
      tsConfigFilePath: `${projectPath}/tsconfig.json`
    });
    program = simpleProject.getProgram().compilerObject
  });

  it('Declare variable fix', () => {
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


  it('Declare constructor fix when target kind is child.parent.kind === ts.SyntaxKind.NewExpression', () => {
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
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
    const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log, simpleNode: child, program , sourceFile: sourceFile.compilerNode}
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail('no fixes for knowndiagnostic');
    }
    fixes[0].apply(arg);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain(`class A{
    public constructor(aString: String) {`)
  })


  it('Declare class when extending non existent', () => {
    const filePath = `/src/third.ts`
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(filePath));

    const diagnostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, 19);
    if (!diagnostics || !diagnostics.length) {
      return fail('no diagnostics found');
    }
    const h = sourceFile.getDescendantsOfKind(ts.SyntaxKind.HeritageClause)[0]
    const id = h.getDescendantsOfKind(ts.SyntaxKind.Identifier)[0]
    const arg: CodeFixOptions = { diagnostics, containingTarget: id.compilerNode, containingTargetLight: id.compilerNode, log, program, simpleNode: id, sourceFile: sourceFile.compilerNode }
    const fixes = codeFixes.filter(fix => fix.predicate(arg));
    if (!fixes || !fixes.length) {
      return fail('no fixes for knowndiagnostic');
    }
    fixes[0].apply(arg);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}${filePath}`).toString()).toContain(`class NonExistent {`)
  })
});
