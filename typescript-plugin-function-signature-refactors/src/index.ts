import { now, timeFrom } from 'hrtime-now';
import * as ts from 'typescript';
import { findChildContainedRange, findChildContainingRange, findChildContainingRangeLight, positionOrRangeToNumber, positionOrRangeToRange } from 'typescript-ast-util';
import { CodeFixOptions, getPluginCreate, LanguageServiceOptionals, createSimpleASTProject } from 'typescript-plugin-util';
import { Action } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { getRefactors, PLUGIN_NAME, SignatureRefactorArgs, SignatureRefactorsCodeFix } from './refactors';


const log = (msg: string) => info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)

function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const t0 = now()
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options)
  getAllRefactors().forEach(refactor => {
    const refactorCompletions = refactor.getCompletionsAtPosition(fileName, position, options)
    // log('getCompletionsAtPosition entries count: '+JSON.stringify(refactorCompletions))
    prior.entries = prior.entries.concat(refactorCompletions)
  })
  // log(`getCompletionsAtPosition took ${timeFrom(t0)}`)
  return prior
}

let selectedAction: Action
let opts: CodeFixOptions 


function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts.UserPreferences): ts.ApplicableRefactorInfo[] {
  const t0 = now()
  let refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences)
  // const refactors = getAllRefactors()
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    log(`getCodeFix false because !sourceFile`)
    return
  }
  const diagnostics = []
  const start = positionOrRangeToNumber(positionOrRange)
  const range = positionOrRangeToRange(start + 1)
  const containingTarget = findChildContainingRange(sourceFile, range) || sourceFile
  const containingTargetLight = findChildContainingRangeLight(sourceFile, range) || sourceFile
  const containedTarget = findChildContainedRange(sourceFile, range) || sourceFile
  opts = { diagnostics, containingTarget, containingTargetLight, containedTarget, log, program, sourceFile, positionOrRange }
  getAllRefactors()
    .filter(refactor => {
      try {
        return refactor.predicate(opts)
      } catch (ex) {
        log('getCodeFix exception in plugin predicate ' + refactor.name + ex + '\n' + ex.stack)
      }
    })
    .filter(r => !!r)
    .forEach(refactor => {
      refactors = refactors.concat(
        refactor.getApplicableRefactors(info, `${PLUGIN_NAME}`, `${PLUGIN_NAME}-${refactor.name}`, fileName, positionOrRange, userPreferences).refactors
      )
    })
  log(`getApplicableRefactors took ${timeFrom(t0)}`)
  // log(`EFFFFFF ${JSON.stringify(refactors)}`)
  return refactors
}

// TODO: This should be agnostic to any plugin such as proactive's
function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts_module.TextRange, refactorName: string, actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {

  const t0 = now()
  // const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (actionName.startsWith(PLUGIN_NAME)) {
    const name = actionName.substring(PLUGIN_NAME.length+1, actionName.length)
    const refactor = getAllRefactors().find(r=>r.name=== name)
    if(!refactor){
      log(`getEditsForRefactor abort because refactor named ${name} not found`)
      return
    }
    try {
      log(`getEditsForRefactor refactor found ${refactor.name}`)
      opts.simpleProject = createSimpleASTProject(info.project)
      const sourceFile = opts.simpleProject.getSourceFileOrThrow(fileName)
      opts.simpleNode = sourceFile.getDescendantAtPos(positionOrRangeToNumber(positionOrRange)) || sourceFile
      refactor.apply(opts)
      // refactor.apply(opts)
      // const funcDecl = getFunctionSimple(sourceFile, positionOrRangeToNumber(positionOrRange), selectedAction.args.name)
      // log(`getEditsForRefactor ${funcDecl && funcDecl.getKindName()} [${selectedAction.args && selectedAction.args.reorder && selectedAction.args.reorder.join(', ')}] ${funcDecl && funcDecl.getText()}`)
      // reorderParameters(funcDecl, selectedAction.args.reorder)
      // sourceFile.saveSync()
    }
    catch (error) {
      log(`getEditsForRefactor error ${error + ' - ' + error.stack}`)
      // return refactors
    }
    // log(`getEditsForRefactor ${selectedAction.name} took  ${timeFrom(t0)}`)
  }
  return
}


let info: ts_module.server.PluginCreateInfo
const pluginDefinition: LanguageServiceOptionals = {
  getApplicableRefactors, getEditsForRefactor, getCompletionsAtPosition
}
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  info = anInfo
  log(`created`)
})

function getAllRefactors(): SignatureRefactorsCodeFix[] {
  return getRefactors(getRefactorsConfig())
}
function getRefactorsConfig(): SignatureRefactorArgs {
  return { log, program: info.languageService.getProgram() }
}