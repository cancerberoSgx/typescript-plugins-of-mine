import { readFileSync } from 'fs';
import { FileSystemHost, Project, SourceFile } from 'ts-simple-ast';

export function printSourceFile(sf: SourceFile) {
  return removeSpaces(sf.getText())
}
export function removeSpaces(s: string): string {
  return s.trim().replace(/[\s]+/gm, ' ')
}

export function sourceFileEquals(file: SourceFile, code: string) {
  expect(printSourceFile(file)).toBe(removeSpaces(code))
}

export function printProjectDiagnostics(project: Project) {
  console.log('ERRORS: ' + project.getPreEmitDiagnostics().map(e => e.getCode()+' - '+e.getMessageText() + ' - ' + (e.getSourceFile() && e.getSourceFile().getFilePath())).join('\n'))
}


export function createProject(lib: string[] = ['es5', 'es6', 'dom', 'scripthost', 'webworker.importscripts']): Project {
  const project = new Project({ useVirtualFileSystem: true });
  const fs = project.getFileSystem();
  loadDtsFiles(fs, lib);
  return project
}
function loadDtsFiles(fs: FileSystemHost, lib: string[]) {
  const fileNames = [`node_modules/typescript/lib/lib.d.ts`].concat(lib.map(l => `node_modules/typescript/lib/lib.${l}.d.ts`))
  fileNames.forEach(absolutePath => {
    const fileText = readFileSync(absolutePath).toString()
    fs.writeFileSync(absolutePath, fileText)
  })
}


export function assertProjectNoErrors(project: Project, except: number[] = []){

  if(project.getPreEmitDiagnostics().filter(d=>!except.includes(d.getCode())).length){
    printProjectDiagnostics(project)
    fail('Project has errors')
  }
}