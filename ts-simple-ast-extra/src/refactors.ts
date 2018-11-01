import Project, { ArrowFunction, ImportDeclaration, Node, SourceFile, Statement } from 'ts-simple-ast';
import { createTextChanges } from '../src';
import { applyCodeFixes, applyFileTextChanges, ApplyFileTextChangesResult } from './changes';

export function addBracesToArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  // project.getLanguageService().compilerObject
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {})
  // arrowFunction.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))
  return applyFileTextChanges(project, edits.edits)
}

export function removeBracesFromArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Remove braces from arrow function', {})
  // arrowFunction.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))  
  return applyFileTextChanges(project, edits.edits)
}

export function moveToNewFile(project: Project, statements: Statement[]): ApplyFileTextChangesResult {
  if(!statements.length){
    return
  }
  const range = { pos: statements[0].getStart(), end: statements[statements.length-1].getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(statements[0].getSourceFile().getFilePath(), {}, range, 'Move to a new file', 'Move to a new file', {})
  return applyFileTextChanges(project, edits.edits)
  // const newFileName = edits.edits[1].fileName
  // let destFile: SourceFile = project.getSourceFiles().find(f => f.getFilePath() === newFileName)
  // if (!destFile) {
  //   destFile = project.createSourceFile(newFileName, '')
  // }
  // else {
  //   // probably is an error
  // }

  // const destFileTextChanges = createTextChanges(edits.edits[1].textChanges)
  // destFile.applyTextChanges(destFileTextChanges)
  // statements[0].getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))

}

export function convertToEs6Module(project: Project, file: SourceFile, importDeclaration?: ImportDeclaration) {
  const fixes = project.getLanguageService().compilerObject.getCodeFixesAtPosition(file.getFilePath(), importDeclaration ? importDeclaration.getStart() : 0, importDeclaration ? importDeclaration.getEnd() : file.getEnd(), [80001], {}, {})
  return applyCodeFixes(project, fixes)
  // fixes.forEach(fix => {
  //   fix.changes.forEach(change => {
  //     file.applyTextChanges(createTextChanges(change.textChanges))
  //   })
  // })
  // const range = {pos: arrowFunction.getStart(), end: arrowFunction.getEnd()}
  // const edits =     project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(),{}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {})
  // arrowFunction.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))
}


// it doesn't work
export function fixUnusedIdentifiers(project: Project, file: SourceFile, rootNode?: Node) {
  // project.getLanguageService().compilerObject
  // const range = 
  const fixes = project.getLanguageService().compilerObject.getCodeFixesAtPosition(file.getFilePath(), rootNode ? rootNode.getStart() : 0, rootNode ? rootNode.getEnd() : file.getEnd(),
    [
      6138,
      6196,
      6138,
      //  6192, 6198, 6199, 6205
    ], {}, {})

  fixes.forEach(fix => {
    fix.changes.forEach(change => {

      file.applyTextChanges(createTextChanges(change.textChanges))
      // textChanges = textChanges.concat(change.textChanges)
    })
  })
  // console.log(textChanges);

  // const range = {pos: arrowFunction.getStart(), end: arrowFunction.getEnd()}
  // const edits =     project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(),{}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {})
  // arrowFunction.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))
}

