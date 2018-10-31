import Project, { SourceFile, NamedNode, ArrowFunction, Node, TypeGuards } from 'ts-simple-ast';
import { applyTextChanges, createTextChanges } from '../src';


export function addBracesToArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = {pos: arrowFunction.getStart(), end: arrowFunction.getEnd()}
  const edits =     project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(),{}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {})
  arrowFunction.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))
}


export function removeBracesFromArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = {pos: arrowFunction.getStart(), end: arrowFunction.getEnd()}
  const edits =     project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(),{}, range, 'Add or remove braces in an arrow function', 'Remove braces from arrow function', {})
  arrowFunction.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))
}

export function moveToNewFile(project: Project, declaration: NamedNode&Node, newFilePath?: string){
  const range = {pos: declaration.getNameNode().getStart(), end: declaration.getNameNode().getEnd()}
  const edits =     project.getLanguageService().compilerObject.getEditsForRefactor(declaration.getSourceFile().getFilePath(),{}, range, 'Move to a new file', 'Move to a new file', {})
  const newFileName = newFilePath ||edits.edits[1].fileName
  let destFile: SourceFile = project.getSourceFiles().find(f=>f.getFilePath()===newFileName)
  if(!destFile){
    destFile = project.createSourceFile(newFileName, '')
  }
  else {
    // probably is an error
  }

  const destFileTextChanges = createTextChanges(edits.edits[1].textChanges)
  destFile.applyTextChanges(destFileTextChanges)
  declaration.getSourceFile().applyTextChanges(createTextChanges(edits.edits[0].textChanges))
  
}