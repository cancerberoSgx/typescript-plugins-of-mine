import { Node, Project } from 'ts-morph'
import { applyRefactorEditInfo } from '../../changes'

export function convertNamespaceImportToNamedImports(project: Project, node: Node) {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project
    .getLanguageService()
    .compilerObject.getEditsForRefactor(
      node.getSourceFile().getFilePath(),
      {},
      range,
      'Convert import',
      'Convert namespace import to named imports',
      {}
    )
  if (edits) {
    return applyRefactorEditInfo(project, edits)
  }
}

export function convertNamedImportsToNamespaceImport(project: Project, node: Node) {
  const range = { pos: node.getStart(), end: node.getEnd() }
  const edits = project
    .getLanguageService()
    .compilerObject.getEditsForRefactor(
      node.getSourceFile().getFilePath(),
      {},
      range,
      'Convert import',
      'Convert named imports to namespace import',
      {}
    )
  if (edits) {
    return applyRefactorEditInfo(project, edits)
  }
}
