import { Project, ArrowFunction } from 'ts-morph';
import { applyRefactorEditInfo } from './changes';

export function addBracesToArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() };
  const edits = project
    .getLanguageService()
    .compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Add braces to arrow function', {});
  if (edits) {
    return applyRefactorEditInfo(project, edits);
  }
}

export function removeBracesFromArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() };
  const edits = project
    .getLanguageService()
    .compilerObject.getEditsForRefactor(arrowFunction.getSourceFile().getFilePath(), {}, range, 'Add or remove braces in an arrow function', 'Remove braces from arrow function', {});
  if (edits) {
    return applyRefactorEditInfo(project, edits);
  }
}
