import { Node, Project } from 'ts-morph'
import { applyAllSuggestedCodeFixes } from './changes'

export function removeAllUnused(project: Project, node: Node) {
  return applyAllSuggestedCodeFixes(project, node, [
    6133,
    7028,
    6199,
    6192 // All imports in import declaration are unused.
  ])
}
