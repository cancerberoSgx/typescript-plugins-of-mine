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
        target: ScriptTarget.ES2018,
      },
      // useVirtualFileSystem: true
    })
  }
  let newSourceFile: SourceFile
  if (config.createNewFile) {
    newSourceFile = simpleProject.createSourceFile('tmp/sourceFileTmp__' + Date.now() + '.ts', '', {})
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

export function getCodeFixOptionsForPredicate (positionOrRange: number|number[], config: DefaultBeforeEachResult): CodeFixOptions{
  const position = typeof positionOrRange === 'number' ? positionOrRange : positionOrRange[0]
  const child = config.newSourceFile.getDescendantAtPos(position)
  const diagnostics = getDiagnosticsInCurrentLocation(config.simpleProject.getProgram().compilerObject, config.newSourceFile.compilerNode, position)
  const arg: CodeFixOptions = {
    simpleProject: config.simpleProject,
    diagnostics, 
    containingTarget: child.compilerNode, 
    containingTargetLight: child.compilerNode, 
    log: defaultLog, 
    simpleNode: child,
    program: config.simpleProject.getProgram().compilerObject, 
    sourceFile: config.newSourceFile.compilerNode, 
    positionOrRange: typeof positionOrRange === 'number' ? {pos: positionOrRange, end: positionOrRange} : {pos: positionOrRange[0], end: positionOrRange[1]}
  }
  return arg
}

export function getCodeFix(arg: CodeFixOptions, fixName: string, verbose: boolean = false ): CodeFix|undefined {
  if(verbose){
    console.log(`Target node ${arg.simpleNode.getKindName()}, text: ${arg.simpleNode.getText()}`)
    console.log(`Diagnostics matched in that position: ${arg.diagnostics.map(d=>d.messageText).join(', ')}`)
  }
  const fixes = codeFixes.filter(fix => fix.predicate(arg))
  if (!fixes || !fixes.length) {
    fail('no fixes found with true predicate')
    return
  }
  return expectToContainFixer(fixes, fixName)
}

export function basicTest(position: number, config: DefaultBeforeEachResult, fixName: string, assertBeforeNotContainCode: string[], assertAfterContainCode: string[] = assertBeforeNotContainCode, verbose: boolean = false, transformText: string | false = ' ') {
  const arg = getCodeFixOptionsForPredicate(position, config)
  const fix = getCodeFix(arg, fixName, verbose)
  expect(!!fix.predicate(arg)).toBe(true)
  let text = transformText === false ? config.newSourceFile.getText() : removeWhiteSpaces(config.newSourceFile.getText(), transformText)
  assertBeforeNotContainCode.forEach(s => expect(text).not.toContain(s))
  if (verbose) {
    console.log(text)
  }
  arg.log = verbose ? (msg)=>console.log('DEBUG log: '+msg) : defaultLog
  fix.apply(arg)
  text = transformText === false ? config.newSourceFile.getText() : removeWhiteSpaces(config.newSourceFile.getText(), transformText)
  assertAfterContainCode.forEach(s => expect(text).toContain(s))
  if (verbose) {
    console.log(text)
  }
}