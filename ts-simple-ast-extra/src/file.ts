import Project, { TextChange, SourceFile } from 'ts-simple-ast';

let applyTextChangesSourceFile : SourceFile

function applyTextChangesGetSourceFile(){
  if(!applyTextChangesSourceFile){
    const project = new Project({useVirtualFileSystem: true})
    applyTextChangesSourceFile =project.createSourceFile('tmp.ts','')
  }
  return applyTextChangesSourceFile
}

export function applyTextChanges(code: string, textChanges: ts.TextChange[]) : string{
  const simpleTextChanges =  textChanges.map(compilerNode=>{
    return new (TextChange as any)(compilerNode) // Hack because this constructor in internal
  })
  const sourceFile = applyTextChangesGetSourceFile()
  sourceFile.replaceWithText(code)
  sourceFile.applyTextChanges(simpleTextChanges)
  return sourceFile.getText()
}