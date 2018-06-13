import * as shell from 'shelljs';
import Project, { SourceFile } from 'ts-simple-ast';
import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import { CodeFix, codeFixes, CodeFixOptions } from '../src/typings';

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
        tsConfigFilePath: "./tsconfig.json",
        addFilesFromTsConfig: false
      }
    })
  }
  let newSourceFile: SourceFile
  if (config.createNewFile) {
    newSourceFile = simpleProject.createSourceFile('tmp/sourceFileTmp__' + Date.now() + '.ts', '')
    if (typeof config.createNewFile === 'string') {
      newSourceFile.addStatements(config.createNewFile)
      // simpleProject.saveSync()
      // newSourceFile.saveSync()
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
  // shell.rm('-rf', config.projectPath)
  if (config.newSourceFile)
    config.newSourceFile.deleteImmediatelySync()
}

export function findLocationActiveFix(start: number, end: number, config: DefaultBeforeEachResult, file: SourceFile, fixName: string): number {
  const program = config.simpleProject.getProgram().compilerObject
  for (let i = start; i < end; i++) {
    const child = file.getDescendantAtPos(i);
    if (!child) return
    const diagnostics = getDiagnosticsInCurrentLocation(program, file.compilerNode, i)
    const arg: CodeFixOptions = { diagnostics, containingTarget: child.compilerNode, containingTargetLight: child.compilerNode, log: (msg) => { }, simpleNode: child, program, sourceFile: file.compilerNode }
    const fix = codeFixes.filter(fix => fix.predicate(arg) && fix.name === fixName);
    if (fix && fix.length) {
      return i
    }
  }
}