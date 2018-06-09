import { now, timeFrom } from 'hrtime-now';
import { Project, SourceFile, SourceFileAddOptions } from 'ts-simple-ast';
import { findChildContainedRange, findChildContainingRange, getKindName, positionOrRangeToNumber, positionOrRangeToRange, findChildContainingRangeLight } from 'typescript-ast-util';
import { createSimpleASTProject, getPluginCreate, LanguageServiceOptionals } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { CodeFixOptions, codeFixes, CodeFix } from './codeFixes';

const PLUGIN_NAME = 'typescript-plugin-proactive-code-fixes'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo
let log
const pluginDefinition: LanguageServiceOptionals = { getApplicableRefactors, getEditsForRefactor }
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  log = function (msg) {
    info.project.projectService.logger.info(`Plugin ${PLUGIN_NAME}, Fix: ${currentFix && currentFix.name}, Message: ${msg}`)
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})


let target: CodeFixOptions

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences)
  : ts.ApplicableRefactorInfo[] {
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences) || []
  const codeFix = getCodeFix(fileName, positionOrRange)
  if (!codeFix) {
    return refactors
  }
  target = codeFix.target
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Code Fixes',
    actions: codeFix.fixes.map(fix => ({
      name: REFACTOR_ACTION_NAME + '-' + fix.name,
      description: fix.description(target)
    }))
  })
  return refactors
}





function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts.TextRange, refactorName: string,   actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const t0 = now()
  log(`getEditsForRefactor ${positionOrRange} ${refactorName} ${actionName}`)
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (!actionName.startsWith(REFACTOR_ACTION_NAME) || !target.containingTarget) {
    return refactors
  }
  const fixName = actionName.substring(REFACTOR_ACTION_NAME.length + 1, actionName.length)
  const fix = codeFixes.find(fix => fix.name === fixName)
  if (!fix) {
    log(`no getEditsForRefactor because no fix was found for actionName == ${actionName}`)
    return refactors
  }
  applyCodeFix(fix, target, formatOptions, positionOrRange)
  log(`getEditsForRefactor total time took ${timeFrom(t0)}`)
  return refactors
}





function getCodeFix(fileName: string, positionOrRange: number | ts.TextRange, end?: number, errorCodes?: ReadonlyArray<number>, formatOptions?: ts.FormatCodeSettings): { fixes: CodeFix[], target: CodeFixOptions } | undefined {
  const t0 = now()
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    log(`getCodeFix false because !sourceFile`)
    return
  }
  const getDiagnosticT0 = now()
  let diagnostics
  const start = positionOrRangeToNumber(positionOrRange)
  if (errorCodes) {
    diagnostics = errorCodes.map(code => ({
      file: sourceFile,
      start: start,
      length: end - start,
      messageText: 'dummy',
      category: ts_module.DiagnosticCategory.Error,
      code
    }))
  }
  else {
    diagnostics = ts.getPreEmitDiagnostics(program, sourceFile)
  }
  log(`getPreEmitDiagnostics took ${timeFrom(getDiagnosticT0)}`)
  const range = positionOrRangeToRange(start+1)
  const containingTarget = findChildContainingRange(sourceFile, range)
  const containingTargetLight = findChildContainingRangeLight(sourceFile, range)
  const containedTarget = findChildContainedRange(sourceFile, range) || sourceFile
  if (!containingTarget) {
    log(`no getCodeFix because findChildContainedRange  target node is undefined `)
    return
  }
  log(`getCodeFix info: containingTarget.kind == ${getKindName(containingTarget.kind)} containedTarget.kind == ${containedTarget ? getKindName(containedTarget.kind) : 'NOCONTAINEDCHILD'} `)
  const codeFixesFilterT0 = now()
  const target = { diagnostics, containingTarget, containingTargetLight, containedTarget, log, program, sourceFile, /*range, fileName,project: info.project*/ }
  const fixes = codeFixes.filter(fix => {
    try {
      return fix.predicate(target)
    } catch (ex) {
      log('getCodeFix exception in plugin predicates ' + fix.name + ex + '\n' + ex.stack)
      // TODO LOG
    }
  })
  log(`codeFixesFilterT0 took ${timeFrom(codeFixesFilterT0)}`)
  if (!fixes || !fixes.length) {
    log(`no getCodeFix because no codeFixes returned true for node of kind ==${getKindName(containingTarget.kind)} and diagnostics: ${diagnostics.map(d => d.code)}`)
    return
  }
  log(`getCodeFix took ${timeFrom(t0)}`)
  return { fixes, target }
}



let currentFix: CodeFix
function applyCodeFix(fix: CodeFix,  options: CodeFixOptions,   formatOptions, positionOrRange: number | ts.TextRange) {
  let simpleProject: Project
  let sourceFile: SourceFile
  const fileName = options.sourceFile.fileName
  if (fix && fix.needSimpleAst !== false) {
    const createSimpleASTProjectT0 = now()
    simpleProject = createSimpleASTProject(info.project)
    log(`applyCodeFix createSimpleASTProject took ${timeFrom(createSimpleASTProjectT0)}`)
    const simpleNodeT0 = now()
    sourceFile = simpleProject.getSourceFile(options.sourceFile.fileName)
    options.simpleNode = sourceFile.getDescendantAtPos(positionOrRangeToNumber(positionOrRange)) || sourceFile
    options.simpleProject = simpleProject
    if (!options.simpleNode) {
      log(`no applyCodeFix because sourceFile is null for fileName=== ${fileName}`)
      return null
    }
    log(`applyCodeFix first getSourceFile() and simpleNode took ${timeFrom(simpleNodeT0)} and node.kind is ${options.simpleNode.getKindName()}`)
  }
  // we are ready, with or without ast-simple to perform the change
  const fixapplyT0 = now()
  currentFix = fix
  try {
    fix.apply(options)
  } catch (error) {
    log(`applyCodeFix fix.apply() error ${error} \n ${error.stack}`)
  }
  log(`applyCodeFix fix.apply() took ${timeFrom(fixapplyT0)}`)
  if (fix.needSimpleAst !== false) {
    const saveSyncT0 = now()
    sourceFile.formatText(formatOptions)
    simpleProject.saveSync()
    log(`applyCodeFix saveSync took ${timeFrom(saveSyncT0)}`)
  }
  else {
    // when needSimpleAst===false code fix implementation is responsible of save/emit/update the files / project 
  }
}







// function getCodeFixesAtPosition(fileName: string, start: number, end: number, errorCodes: ReadonlyArray<number>, formatOptions: ts.FormatCodeSettings, userPreferences: ts_module.UserPreferences): ReadonlyArray<ts.CodeFixAction> {
//   const originalCodeFixes = info.languageService.getCodeFixesAtPosition(fileName, start, end, errorCodes, formatOptions, userPreferences)
//   const codeFix = getCodeFix(fileName, start, end, errorCodes, formatOptions)
//   if (!codeFix) {
//     log(`getCodeFixesAtPosition false because !codeFix`)
//     return originalCodeFixes
//   }
//   target = codeFix.target
//   const codeFixActions = codeFix.fixes.map(f => ({
//     fixId: REFACTOR_ACTION_NAME + '-' + f.name,
//     description: f.description(codeFix.target),
//     fixName: REFACTOR_ACTION_NAME + '-' + f.name,
//     changes: []
//   }))
//   log(`getCodeFixesAtPosition - completions returned by .languageService.getCodeFixesAtPosition are  ${codeFixActions ? JSON.stringify(originalCodeFixes) : 'codeFixActions'}  -  ${start}`)
//   return originalCodeFixes.concat(codeFixActions)
// }


// function getCombinedCodeFix(scope: ts.CombinedCodeFixScope, fixId: string, formatOptions: ts.FormatCodeSettings): ts.CombinedCodeActions {
//   const t0 = now()
//   log(`getCombinedCodeFix fixId`)
//   const prior = getCombinedCodeFix(scope, fixId, formatOptions)
//   if (!fixId.startsWith(REFACTOR_ACTION_NAME) || !target.containingTarget) {
//     log(`no getCombinedCodeFix ${fixId} because and !fixId.startsWith(REFACTOR_ACTION_NAME) || !target.containingTarget`)
//     return prior
//   }
//   const fixName = fixId.substring(REFACTOR_ACTION_NAME.length + 1, fixId.length)
//   const fix = codeFixes.find(fix => fix.name === fixName)
//   if (!fix) {
//     info.project.projectService.logger.info(`no getCombinedCodeFix ${fixId} because no fix was found for actionName == ${fixId}`)
//     return prior
//   }
//   applyCodeFix(fix, target, formatOptions, target.containingTarget.getStart())
//   log(`no getCombinedCodeFix ${fixId} total time took ${timeFrom(t0)}`)
//   return prior
// }