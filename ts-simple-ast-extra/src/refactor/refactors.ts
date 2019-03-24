import Project, { ArrowFunction, Node } from 'ts-morph';
import { applyAllSuggestedCodeFixes, ApplyFileTextChangesResult, applyRefactorEditInfo } from './changes';

export function addBracesToArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {})
  if(edits){
    return applyRefactorEditInfo(project, edits)
  }
}

export function removeBracesFromArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Remove braces from arrow function', {})
  if(edits){
    return applyRefactorEditInfo(project, edits)
  }
}

export function moveToNewFile(project: Project, node: Node, removeEmpty: boolean=false): ApplyFileTextChangesResult|undefined {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(node.getSourceFile().getFilePath(), {}, range, 'Move to a new file', 'Move to a new file', {})
  if(edits){
    return applyRefactorEditInfo(project, edits, removeEmpty)
  }

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

export function inferTypesFromUsage(project: Project, node: Node) {
  return applyAllSuggestedCodeFixes(project, node, [7043, 7044, 7045, 7046, 7047, 7048, 7049, 7050, 7051])
}

export function  convertNamespaceImportToNamedImports(project: Project, node: Node) {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(node.getSourceFile().getFilePath(), {}, range, 'Convert import', 'Convert namespace import to named imports', {})
  if(edits){
    return applyRefactorEditInfo(project, edits)
  }
 }

export function convertNamedImportsToNamespaceImport(project: Project, node: Node) {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project.getLanguageService().compilerObject.getEditsForRefactor(node.getSourceFile().getFilePath(), {}, range, 'Convert import', 'Convert named imports to namespace import', {})
  if(edits){
    return applyRefactorEditInfo(project, edits)
  }
}