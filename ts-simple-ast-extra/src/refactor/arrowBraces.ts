import { ArrowFunction, Node, Project, TypeGuards } from 'ts-morph'
import { applyRefactorEditInfo } from './changes'

/**
 * Add braces to all arrow function descendants of given node without them.
 */
export function addBracesToArrowFunctions(project: Project, node: Node) {
  const arrows = node.getDescendants().filter(TypeGuards.isArrowFunction)
  arrows.forEach((a, i) => {
    const arrow = node.getDescendants().filter(TypeGuards.isArrowFunction)[i]
    addBracesToArrowFunction(project, arrow)
  })
}

/**
 * Add braces to given arrow function.
 */
export function addBracesToArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const edits = getRefactorEditInfo(project, arrowFunction)
  if (edits) {
    return applyRefactorEditInfo(project, edits.compilerObject)
  }
}

function getRefactorEditInfo(project: Project, arrowFunction: ArrowFunction) {
  return project
    .getLanguageService()
    .getEditsForRefactor(
      arrowFunction!.getSourceFile().getFilePath(),
      {},
      arrowFunction,
      'Add or remove braces in an arrow function',
      'Add braces to arrow function',
      {}
    )
}

/**
 * Remove braces from all node descendant arrow functions that allows it.
 */
export function removeBracesFromArrowFunctions(project: Project, node: Node) {
  const arrows = node.getDescendants().filter(TypeGuards.isArrowFunction)
  arrows.forEach((a, i) => {
    const arrow = node.getDescendants().filter(TypeGuards.isArrowFunction)[i]
    removeBracesFromArrowFunction(project, arrow)
  })
}

/**
 * Removes braces from given arrow function if allows it.
 */
export function removeBracesFromArrowFunction(project: Project, arrowFunction: ArrowFunction) {
  const range = { pos: arrowFunction.getStart(), end: arrowFunction.getEnd() }
  const edits = project
    .getLanguageService()
    .compilerObject.getEditsForRefactor(
      arrowFunction.getSourceFile().getFilePath(),
      {},
      range,
      'Add or remove braces in an arrow function',
      'Remove braces from arrow function',
      {}
    )
  if (edits) {
    return applyRefactorEditInfo(project, edits)
  }
}
