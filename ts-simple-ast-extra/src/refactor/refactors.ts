import { Node, Project } from 'ts-morph'
import { applyAllSuggestedCodeFixes } from './changes'

export function convertToEs6Module(project: Project, node: Node) {
  return applyAllSuggestedCodeFixes(project, node, [80001, 80005])
}

export function inferTypesFromUsage(project: Project, node: Node) {
  return applyAllSuggestedCodeFixes(project, node, [7043, 7044, 7045, 7046, 7047, 7048, 7049, 7050, 7051])
}
