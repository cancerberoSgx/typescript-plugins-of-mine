// Extract interface from a class declaration. Write it just before the class declaration and make the class implement it. Only members with "public" modifier will be extracted
//
// **Screencast**: 
// 
// ![See it in action](../plugin-screencast.gif)

import * as ts_module from '../node_modules/typescript/lib/tsserverlibrary'
import { findNodeAtPosition, findParent, positionOrRangeToNumber, positionOrRangeToRange, findNodeParentFromPosition } from './ast-util'
import { extractInterface } from './extract-interface'

function init(modules: { typescript: typeof ts_module }) {

  const ts = modules.typescript
  const PLUGIN_NAME = 'typescript-plugin-extract-interface'
  const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

  function create(info: ts_module.server.PluginCreateInfo) {

    info.project.projectService.logger.info(`${PLUGIN_NAME} create`)

    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }
    proxy.getApplicableRefactors = (fileName: string, positionOrRange: number | ts.TextRange): ts_module.ApplicableRefactorInfo[] => {
      const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
      const targetNode = findNodeParentFromPosition(info, fileName, positionOrRange, parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
      if (!targetNode) {
        return refactors
      }
      const refactorInfo: ts_module.ApplicableRefactorInfo = {
        name: `${PLUGIN_NAME}-refactor-info`,
        description: 'Extract interface',
        actions: [{ name: REFACTOR_ACTION_NAME, description: 'Extract interface' }],
      }
      refactors.push(refactorInfo)
      return refactors
    }

    proxy.getEditsForRefactor = (fileName, formatOptions, positionOrRange, refactorName, actionName) => {
      const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
      if (actionName !== REFACTOR_ACTION_NAME) {
        refactors
      }
      const targetNode = findNodeParentFromPosition(info, fileName, positionOrRange, parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
      if (!targetNode) {
        return refactors
      }
      const newText = extractInterface(targetNode as ts_module.ClassDeclaration)
      const range = positionOrRangeToRange(positionOrRange)
      const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
      const editSpan: ts_module.TextSpan = { start: range.end, length: range.end }
      return {
        edits: [{
          fileName,
          textChanges: [{
            span: { start: range.end, length: range.end }, // add it right after the class decl
            newText: newText
          }],
        }],
        renameFilename: undefined,
        renameLocation: undefined,
      }
    }
    return proxy
  }

  return { create }
}

export = init