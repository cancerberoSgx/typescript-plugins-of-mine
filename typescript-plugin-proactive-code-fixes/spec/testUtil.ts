import * as shell from 'shelljs';
import Project, { SourceFile } from 'ts-simple-ast';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { CodeFix, codeFixes, CodeFixOptions } from '../src/typings';
import { ScriptTarget } from '../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary';

export function defaultBeforeEach(config: DefaultBeforeEachInput): DefaultBeforeEachResult {
  let simpleProject: Project
  if (config.projectPath) {
    shell.rm(`-rf`, config.projectPath);
    shell.cp(`-r`, `assets/sampleProject1`, `${config.projectPath}`);
    simpleProject = new Project({
      tsConfigFilePath: `${config.projectPath}/tsconfig.json`
    });
  }
  else {
    simpleProject = new Project({
      compilerOptions: {
        target:ScriptTarget.ES2018
      }
    })
  }
  let newSourceFile: SourceFile
  if (config.createNewFile) {
    newSourceFile = simpleProject.createSourceFile('tmp/sourceFileTmp__' + Date.now() + '.ts', '')
    if (typeof config.createNewFile === 'string') {
      newSourceFile.addStatements(config.createNewFile)
    }
  }
  return Object.assign({}, config, { simpleProject, newSourceFile })
}

export interface DefaultBeforeEachResult extends DefaultBeforeEachInput {
  simpleProject: Project,
  newSourceFile: SourceFile | undefined
}

export interface DefaultBeforeEachInput {
  projectPath?: string,
  createNewFile?: boolean | string
}

export function expectToContainFixer(fixes: CodeFix[], name: string): CodeFix | undefined {
  let fix
  if ((fix = fixes.find(f => f.name == name))) {
    expect(`fixes contain a fix named ${name}`).toBe(`fixes contain a fix named ${name}`)
    return fix
  } else {
    fail(`fixes [${fixes.map(f => f.name).join(', ')}] doesn't contain a fix named ${name}`)
    return
  }
}
export function removeWhiteSpaces(s: string, sep: string = ''): string {
  return s.replace(/\s+/gm, sep)
}
export function defaultAfterEach(config: DefaultBeforeEachResult) {
  if (config.newSourceFile)
    config.newSourceFile.deleteImmediatelySync()
}

export function findLocationActiveFix(start: number, end: number, config: DefaultBeforeEachResult, file: SourceFile, fixName: string): number {
  const program = config.simpleProject.getProgram().compilerObject
  for (let i = start; i < end; i++) {
    const child = file.getDescendantAtPos(i);
    if (!child) return
    const diagnostics = getDiagnosticsInCurrentLocation(program, file.compilerNode, i)
    const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log: defaultLog, simpleNode: child, program, sourceFile: file.compilerNode }
    const fix = codeFixes.filter(fix => fix.predicate(arg) && fix.name === fixName);
    if (fix && fix.length) {
      return i
    }
  }
}

export function defaultLog(msg) { }

export function basicTest(position: number, config: DefaultBeforeEachResult, fixerToContain: string, assertBeforeNotContainCode: string[],  assertAfterContainCode: string[] = assertBeforeNotContainCode ) {
  const child = config.newSourceFile.getDescendantAtPos(position)
  const diagnostics = getDiagnosticsInCurrentLocation(config.simpleProject.getProgram().compilerObject, config.newSourceFile.compilerNode, position)
  const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log: defaultLog, simpleNode: child, program: config.simpleProject.getProgram().compilerObject, sourceFile: config.newSourceFile.compilerNode }
  const fixes = codeFixes.filter(fix => fix.predicate(arg))
  // console.log(child.getKindName(), diagnostics, fixes)
  if (!fixes || !fixes.length) {
    return fail('no fixes found with true predicate')
  }
  const fix = expectToContainFixer(fixes, fixerToContain)
  expect(!!fix.predicate(arg)).toBe(true)
  assertBeforeNotContainCode.forEach(s=>expect(removeWhiteSpaces(config.newSourceFile.getText(), ' ')).not.toContain(s))
  // console.log(removeWhiteSpaces(config.newSourceFile.getText(), ' '));
  fix.apply(arg)
  assertAfterContainCode.forEach(s=>expect(removeWhiteSpaces(config.newSourceFile.getText(), ' ')).toContain(s))
  // console.log(removeWhiteSpaces(config.newSourceFile.getText(), ' '));
}