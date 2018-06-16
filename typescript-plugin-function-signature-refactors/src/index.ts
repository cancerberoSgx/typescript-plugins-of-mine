import { now, timeFrom } from 'hrtime-now';
import * as ts from 'typescript';
import { positionOrRangeToNumber } from 'typescript-ast-util';
import { createSimpleASTProject, getPluginCreate, LanguageServiceOptionals } from 'typescript-plugin-util';
import { Action, Tool } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';
// import { reorderParameters } from './reorderParams';
// import { getFunctionSimple, getTextUITool, PLUGIN_NAME, REFACTOR_ACTION_NAME } from './reorderParamsPlugin';

const PLUGIN_NAME = 'typescript-plugin-function-signature-refactors'
const log = (msg: string) => info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
let uiTool: Tool

function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options)
  if (prior) {
    prior.entries = prior.entries.concat(uiTool.getCompletionsAtPosition(fileName, position, options))
  }
  return prior
}

let selectedAction: Action
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts.UserPreferences): ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const result = uiTool.getApplicableRefactors(info, `${PLUGIN_NAME}-refactor`, REFACTOR_ACTION_NAME, fileName, positionOrRange, userPreferences)
  log(`getApplicableRefactors took ${timeFrom(t0)}`)
  selectedAction = result.selectedAction
  return result.refactors
}


// TODO: This should be agnostic to any plugin such as proactive's
function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts_module.TextRange, refactorName: string, actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (actionName !== REFACTOR_ACTION_NAME) {
    return refactors
  }
  try {
    const simpleProject = createSimpleASTProject(info.project)
    const sourceFile = simpleProject.getSourceFileOrThrow(fileName)
    const funcDecl = getFunctionSimple(sourceFile, positionOrRangeToNumber(positionOrRange), selectedAction.args.name)
    log(`getEditsForRefactor ${funcDecl && funcDecl.getKindName()} [${selectedAction.args && selectedAction.args.reorder && selectedAction.args.reorder.join(', ')}] ${funcDecl && funcDecl.getText()}`)
    reorderParameters(funcDecl, selectedAction.args.reorder)
    sourceFile.saveSync()
  } catch (error) {
    log(`getEditsForRefactor error ${error + ' - ' + error.stack}`)
    return refactors
  }
  log(`getEditsForRefactor ${selectedAction.name} took  ${timeFrom(t0)}`)
}


let info: ts_module.server.PluginCreateInfo
const pluginDefinition: LanguageServiceOptionals = {
  getApplicableRefactors, getEditsForRefactor, getCompletionsAtPosition
}
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  uiTool = getTextUITool({ log, program: info.languageService.getProgram() })
  info = anInfo
  log(`created`)
})
