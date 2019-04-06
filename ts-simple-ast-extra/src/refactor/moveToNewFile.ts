import { Node, Project } from 'ts-morph'
import { ApplyFileTextChangesResult, applyRefactorEditInfo } from './changes'

export function moveToNewFile(
  project: Project,
  node: Node,
  removeEmpty: boolean = false
): ApplyFileTextChangesResult | undefined {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project
    .getLanguageService()
    .compilerObject.getEditsForRefactor(
      node.getSourceFile().getFilePath(),
      {},
      range,
      'Move to a new file',
      'Move to a new file',
      {}
    )
  if (edits) {
    return applyRefactorEditInfo(project, edits, removeEmpty)
  }
}
