import * as shell from 'shelljs';
import Project, { TypeGuards, Program, SourceFile } from 'ts-simple-ast';
import { CodeFix } from '../src/typings';

export function defaultBeforeEach(config: DefaultBeforeEachInput): DefaultBeforeEachResult {
  shell.rm(`-rf`, config.projectPath);
  shell.cp(`-r`, `assets/sampleProject1`, `${config.projectPath}`);
  const simpleProject = new Project({
    tsConfigFilePath: `${config.projectPath}/tsconfig.json`
  });
  const program = simpleProject.getProgram().compilerObject
  let newSourceFile: SourceFile
  if (config.createNewFile) {
    newSourceFile = simpleProject.createSourceFile('tmp/sourceFileTmp__' + Date.now() + '.ts', '')
  }
  return Object.assign({}, config, { program, simpleProject, newSourceFile })
}

export interface DefaultBeforeEachResult extends DefaultBeforeEachInput { program: ts.Program, simpleProject: Project, newSourceFile: SourceFile | undefined }

export interface DefaultBeforeEachInput{ projectPath: string, createNewFile?: boolean }
export function expectToContainFixer(fixes: CodeFix[], name: string): CodeFix|undefined {
  let fix
  if ((fix = fixes.find(f => f.name == name))) {
    expect(`fixes contain a fix named ${name}`).toBe(`fixes contain a fix named ${name}`)
    return fix
  } else {
    fail(`fixes ${fixes.map(f => f.name).join(', ')} doesn't contain a fix named ${name}`)
    return
  }
}
export function removeWhiteSpaces(s:string, sep: string = ''):string{
return s.replace(/\s+/gm, sep)
}
export function defaultAfterEach(config: DefaultBeforeEachResult) {
  // shell.rm('-rf', config.projectPath)
  if(config.newSourceFile)
    config.newSourceFile.deleteImmediatelySync()
}