// Extract interface from a class declaration. Write it just before the class declaration and make the class implement it. Only members with "public" modifier will be extracted
//
// **Screencast**: 
// 
// ![See it in action](../plugin-screencast.gif)

import { findParentFromPosition, positionOrRangeToNumber } from 'typescript-ast-util'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import { now } from 'hrtime-now'

const PLUGIN_NAME = 'typescript-plugin-add-type'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo



function pluginCreateCreate(languageService: any,//ts_module.LanguageService,
  onCreate: (info: ts_module.server.PluginCreateInfo) => undefined)
  : (info: ts_module.server.PluginCreateInfo) => ts_module.LanguageService {

  return function create(info: ts_module.server.PluginCreateInfo): ts_module.LanguageService {
    onCreate(info)
    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }
    for (let i in languageService) {
      (proxy as any)[i] = (languageService as any)[i]
    }
    // proxy
    // proxy.getApplicableRefactors = getApplicableRefactors
    // proxy.getEditsForRefactor = getEditsForRefactor

    return proxy
  }
}

function initReturnTypeSignature(modules: { typescript: typeof ts_module }): { create: (info: ts_module.server.PluginCreateInfo) => ts_module.LanguageService } {
  return undefined as any
}

function pluginCreateInit(languageService: any,//ts_module.LanguageService,
  onInit: (modules: { typescript: typeof ts_module }) => undefined,
  onCreate: (info: ts_module.server.PluginCreateInfo) => undefined)
  : (typeof initReturnTypeSignature) {

  return function init(modules: { typescript: typeof ts_module }) {
    onInit(modules)
    ts = modules.typescript
    const create = pluginCreateCreate(languageService, (anInfo) => {
      info = anInfo
      info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
      return undefined
    })
    return { create }
  }
}


// function init(modules: { typescript: typeof ts_module }) { // todo : pluginCreateInit
//   ts = modules.typescript
//   const create = pluginCreateCreate((anInfo)=>{
//     info = anInfo
//     info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
//   })  
//   return { create }
// }

const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }
export = pluginCreateInit(pluginDefinition, 
  (modules: { typescript: typeof ts_module }): undefined => {
    ts = modules.typescript
    return
  },
  (anInfo) => {
    info = anInfo
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
    return undefined
  })


let selectedDef: ts.ReferencedSymbol | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange): ts_module.ApplicableRefactorInfo[] {
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
  positionOrRange: number | ts_module.TextRange, refactorName: string,
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