import Project, { ArrowFunction, Node, Statement } from 'ts-simple-ast';
import { applyAllSuggestedCodeFixes, ApplyFileTextChangesResult, applyRefactorEditInfo, applyFileTextChanges } from './changes';
import { equal } from 'assert';

export function addBracesToArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {})
  return applyRefactorEditInfo(project, edits)
}

export function removeBracesFromArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Remove braces from arrow function', {})
  return applyRefactorEditInfo(project, edits)
}

export function moveToNewFile(project: Project, node: Node, removeEmpty: boolean=false): ApplyFileTextChangesResult {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(node.getSourceFile().getFilePath(), {}, range, 'Move to a new file', 'Move to a new file', {})
  return applyRefactorEditInfo(project, edits, removeEmpty)
}

export function convertToEs6Module(project: Project, node: Node){
  return applyAllSuggestedCodeFixes(project, node, [80001, 80005])
}

export function removeAllUnused(project: Project, node: Node) {
  return applyAllSuggestedCodeFixes(project, node, [
    6133, // variable is declared but is never read
    7028, 
    6199, 
    6192 // All imports in import declaration are unused.
  ])
}

export function  convertNamespaceImportToNamedImports(project: Project, node: Node) {


  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(node.getSourceFile().getFilePath(), {}, range, 'Convert import', 'Convert namespace import to named imports', {})
  return applyRefactorEditInfo(project, edits)
  

}
export function convertNamedImportsToNamespaceImport(project: Project, node: Node) {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(node.getSourceFile().getFilePath(), {}, range, 'Convert import', 'Convert named imports to namespace import', {})
  return applyRefactorEditInfo(project, edits)
}