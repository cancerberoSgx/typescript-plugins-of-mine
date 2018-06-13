import * as shell from 'shelljs';
import Project, { TypeGuards, Program, SourceFile, ScriptTarget, ModuleKind } from 'ts-simple-ast';
import { CodeFix } from '../src/typings';

export function defaultBeforeEach(config: DefaultBeforeEachInput): DefaultBeforeEachResult {
  let simpleProject: Project
  if(config.projectPath){
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
          lib: ["es2018"], module: ModuleKind.CommonJS
      }
    })
  }
  const program = simpleProject.getProgram().compilerObject
  let newSourceFile: SourceFile
  if (config.createNewFile) {
    newSourceFile = simpleProject.createSourceFile('sourceFileTmp__' + Date.now() + '.ts', typeof config.createNewFile==='string' ? config.createNewFile : '')
  }
  return Object.assign({}, config, { program, simpleProject, newSourceFile })
}

export interface DefaultBeforeEachResult extends DefaultBeforeEachInput { program: ts.Program, simpleProject: Project, newSourceFile: SourceFile | undefined }

export interface DefaultBeforeEachInput{ projectPath?: string, createNewFile?: boolean|string }
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