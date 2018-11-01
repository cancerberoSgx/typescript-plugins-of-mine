import Project, { TextChange, SourceFile, Node } from 'ts-simple-ast';
import * as ts from 'typescript'
import { flat, flatReadOnly } from './misc';

export function createTextChanges(textChanges: ts.TextChange[]): TextChange[] {
  return textChanges.map(compilerNode => {
    return new (TextChange as any)(compilerNode) // Hack because this constructor in internal
  })
}

export function applyTextChanges(code: string, textChanges: ts.TextChange[]): string {
  const simpleTextChanges = createTextChanges(textChanges)
  const sourceFile = applyTextChangesGetSourceFile()
  sourceFile.replaceWithText(code)
  sourceFile.applyTextChanges(simpleTextChanges)
  return sourceFile.getText()
}

export interface ApplyFileTextChangesResult  {modified: SourceFile[], removed: SourceFile[], created: SourceFile[]}
export function applyFileTextChanges(project: Project, ftc: ts.FileTextChanges, removeEmpty: boolean = false, result: ApplyFileTextChangesResult =  {
  modified: [],
  removed: [],
  created: []
}): ApplyFileTextChangesResult {
  // const result: ApplyFileTextChangesResult = {
  //   modified: [],
  //   removed: [],
  //   created: []
  // }
  // fileTextChanges.forEach(ftc =>{
    let file = project.getSourceFile(ftc.fileName)
    if(ftc.isNewFile && file) {
      throw new Error('FileTextChanges instructed to create file '+file+' but it already exists on the project. Aborting!')
    }
    if(!file && !ftc.isNewFile) {
      throw new Error('FileTextChanges instructed to modify existing file '+file+' but it doesn\'t exist. Refusing to create it. Aborting!')
    }
    let created
    if(!file){
      file = project.createSourceFile(ftc.fileName)
      result.created.push(file)
      created=true
    }
    file.applyTextChanges(createTextChanges(ftc.textChanges))
    if(!file.getText().trim() && removeEmpty) {
      project.removeSourceFile(file)
      result.removed.push(file)
    }
    else if(!created) {
      result.modified.push(file)
    }
  // })
  return result
}


// export function applyCodeFixes(project: Project, codeFixes: ReadonlyArray<ts.CodeFixAction>){
//   return codeFixes.map(f=>applyFileTextChanges(project, f.changes))
//   // return applyFileTextChanges(project, codeFixes.map(f=>f.changes))
// }

export function applyRefactorEditInfo(project: Project, refactor: ts.RefactorEditInfo, removeEmpty: boolean=false, result: ApplyFileTextChangesResult =  {
  modified: [],
  removed: [],
  created: []
}): ApplyFileTextChangesResult {
  refactor.edits.forEach(edits=>{
    applyFileTextChanges(project, edits, removeEmpty, result)
  })
  return result
}

export function applyAllSuggestedCodeFixes(project: Project, containerNode: Node, codes?: number[], removeEmpty: boolean = false) {
  const result: ApplyFileTextChangesResult = {
    modified: [],
    removed: [],
    created: []
  }
  let fixes = getSuggestedCodeFixesInside(project, containerNode, codes)
  // console.log(JSON.stringify(fixes));
  
  while (fixes && fixes.length){
    applyFileTextChanges(project, fixes[0].changes[0], removeEmpty, result)
    fixes = getSuggestedCodeFixesInside(project, containerNode, codes) // TODO: performance we only need the first one. Also use comnbinedCodeFix to apply several at once increases performance
    
  }
  return result
  // getSuggestedCodeFixesInsidefo()
  // const fixes = getSuggestedCodeFixesInside(project, containerNode, codes)
  // return fixes.map(f=>applyCodeFixes(project, f))
  // return applyCodeFixes(project, )
}

export function getSuggestedCodeFixesInside(project: Project, containerNode: Node, codes?: number[]): ReadonlyArray<ts.CodeFixAction>{
  const service = project.getLanguageService().compilerObject
  // return flatReadOnly(
   const diagnostics = service
   .getSuggestionDiagnostics(containerNode.getSourceFile().getFilePath())
   .map(d=>{

    //  console.log(d.messageText, d.code, d.start, d.start+d.length, containerNode.getFullStart(), containerNode.getEnd());
     
    if(d.start>=containerNode.getFullStart() && d.start+d.length<=containerNode.getEnd() && (!codes || codes.includes(d.code))){
      return service.getCodeFixesAtPosition(containerNode.getSourceFile().getFilePath(), d.start, d.start+d.length, [d.code], {}, {})
    }
    // else {
    //   return[[]] as any// ReadonlyArray<ReadonlyArray<ts.CodeFixAction>>
    // }
  }).filter(a=>a && a.length)
  return flatReadOnly(diagnostics)
  
}

let applyTextChangesSourceFile: SourceFile

function applyTextChangesGetSourceFile() {
  if (!applyTextChangesSourceFile) {
    const project = new Project({ useVirtualFileSystem: true })
    applyTextChangesSourceFile = project.createSourceFile('tmp.ts', '')
  }
  return applyTextChangesSourceFile
}
