// add types to variables without
//

import { findParentFromPosition, positionOrRangeToNumber } from 'typescript-ast-util'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import { getPluginCreate } from 'typescript-plugin-util'
import { now } from 'hrtime-now'

const PLUGIN_NAME = 'typescript-plugin-add-type'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo



const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})


let selectedDef: ts.ReferencedSymbol | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange): ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const refs = info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange))
  if (!refs || !refs.length) {
    return refactors
  }
  const selectedDefs: ts.ReferencedSymbol[] = refs.filter(r =>
    r.definition && r.definition.kind === ts.ScriptElementKind.classElement && r.definition.fileName === fileName)
  if (!selectedDefs || !selectedDefs.length) {
    return refactors
  }
  selectedDef = selectedDefs[0]
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Add type',
    actions: [
      { name: REFACTOR_ACTION_NAME, description: 'Add type to ' + selectedDef.definition.name }
    ],
  })

  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${now() - t0}`)
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()

  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (actionName != REFACTOR_ACTION_NAME) {
    return refactors
  }
  // find the first parent that is a class declaration starting from given position
  const targetNode = findParentFromPosition(info, fileName, positionOrRange,
    parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
  const newText = 'hello'
  if (targetNode && newText) {
    const targetSourceFile = targetNode.getSourceFile()
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor took ${now() - t0}`)
    return {
      edits: [{
        fileName,
        textChanges: [{
          span: { start: targetSourceFile.getEnd(), length: newText.length },
          newText: newText
        }],
      }],
      renameFilename: undefined,
      renameLocation: undefined,
    }
  }
  else {
    return refactors
  }

}