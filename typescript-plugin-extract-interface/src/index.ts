
import { findParentFromPosition, positionOrRangeToNumber } from 'typescript-ast-util'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import { extractInterface } from './extract-interface'
import { now } from 'hrtime-now'

const PLUGIN_NAME = 'typescript-plugin-extract-interface'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

function init(modules: { typescript: typeof ts_module }) {
  ts = modules.typescript

  function create(anInfo: ts_module.server.PluginCreateInfo) {
    info = anInfo
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)

    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x!.apply(info.languageService, args)
    }

    proxy.getApplicableRefactors = getApplicableRefactors
    proxy.getEditsForRefactor = getEditsForRefactor

    return proxy
  }
  return { create }
}

export = init


let selectedDef: ts.ReferencedSymbol | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, preferences: ts_module.UserPreferences | undefined): ts_module.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, preferences) || []
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
    description: 'Extract interface',
    actions: [
      { name: REFACTOR_ACTION_NAME, description: 'Extract interface from ' + selectedDef.definition.name }
    ],
  })

  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${now() - t0}`)
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string, preferences: ts_module.UserPreferences | undefined): ts.RefactorEditInfo | undefined {
  const t0 = now()

  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, preferences)
  if (actionName != REFACTOR_ACTION_NAME) {
    return refactors
  }
  const sourceFile : ts.SourceFile|undefined = info.languageService.getProgram().getSourceFile(fileName)
  // find the first parent that is a class declaration starting from given position
  const targetNode  = findParentFromPosition(sourceFile, positionOrRange,
    parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
  if(targetNode && ts.isClassDeclaration(targetNode)){
    
  }
  const newText = extractInterface(targetNode as ts_module.ClassDeclaration)
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

