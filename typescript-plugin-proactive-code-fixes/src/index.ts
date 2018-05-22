import { now, timeFrom } from 'hrtime-now';
import { findChildContainingRange, getDiagnosticsInCurrentLocation, getKindName, positionOrRangeToNumber, positionOrRangeToRange, findChildContainedRange } from 'typescript-ast-util';
import { createSimpleASTProject, getPluginCreate } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { codeFixes, PredicateArg } from './codeFixes';


const PLUGIN_NAME = 'typescript-plugin-proactive-code-fixes'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo
let log

const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }

export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  log = function (msg) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})

// let containingTarget: ts.Node | undefined
// let diagnostics: ts.Diagnostic[]

let target: PredicateArg
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts.ApplicableRefactorInfo[] {

  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  const getDiagnosticT0 = now()
  // diagnostics = getDiagnosticsInCurrentLocation(program, sourceFile, positionOrRangeToNumber(positionOrRange)) || []
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile)
  info.project.projectService.logger.info(`${PLUGIN_NAME} getPreEmitDiagnostics took ${timeFrom(getDiagnosticT0)}`)

  const containingTarget = findChildContainingRange(sourceFile, positionOrRangeToRange(positionOrRange))

  const containedTarget = findChildContainedRange(sourceFile, positionOrRangeToRange(positionOrRange))
  if (!containingTarget) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} no getApplicableRefactors because findChildContainedRange  target node is undefined `)
    return refactors
  }


  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors info: containingTarget.kind == ${getKindName(containingTarget.kind)} containedTarget.kind == ${containedTarget ? getKindName(containedTarget.kind) : 'NOCONTAINEDCHILD'} `)

  const codeFixesFilterT0 = now()
  target = { diagnostics, containingTarget, containedTarget, log, program }
  const fixes = codeFixes.filter(fix => fix.predicate(target))
  info.project.projectService.logger.info(`${PLUGIN_NAME} codeFixesFilterT0 took ${timeFrom(codeFixesFilterT0)}`)

  if (!fixes || !fixes.length) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} no getApplicableRefactors because no codeFixes returned true for node of kind ==${getKindName(containingTarget.kind)} and diagnostics: ${diagnostics.map(d => d.code)}`)
    return refactors
  }
  const actions = fixes
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Add type',
    actions: fixes.map(fix => ({
      name: REFACTOR_ACTION_NAME + '-' + fix.name,
      description: fix.description(target)
    }))
  })
  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${timeFrom(t0)}`)
  return refactors
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (!actionName.startsWith(REFACTOR_ACTION_NAME) || !target.containingTarget) {
    return refactors
  }
  const fixName = actionName.substring(REFACTOR_ACTION_NAME.length + 1, actionName.length)
  const fix = codeFixes.find(fix => fix.name === fixName)
  if (!fix) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} no getEditsForRefactor because no fix was found for actionName == ${actionName}`)
    return refactors
  }
  let simpleProject
  if (fix.needSimpleAst !== false) {
    const createSimpleASTProjectT0 = now()
    simpleProject = createSimpleASTProject(info.project)
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor createSimpleASTProject took ${timeFrom(createSimpleASTProjectT0)}`)

    const getSourceFileT0 = now()
    target.simpleNode = simpleProject.getSourceFile(fileName).getDescendantAtPos(positionOrRangeToNumber(positionOrRange))
    if (!target.simpleNode) {
      info.project.projectService.logger.info(`${PLUGIN_NAME} no getEditsForRefactor because getDescentantAt pos returned null for fileName=== ${fileName}, actionName == ${actionName}`)
      return refactors
    }
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor first getSourceFile() took ${timeFrom(getSourceFileT0)} and node.kind is ${target.simpleNode.getKindName()}`)
  }
  const fixapplyT0 = now()
  fix.apply(target)
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor fix.apply() took ${timeFrom(fixapplyT0)}`)

  if (fix.needSimpleAst !== false) {
    const saveSyncT0 = now()
    simpleProject.saveSync();
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor saveSync took ${timeFrom(saveSyncT0)}`)
  }

  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor total time took ${timeFrom(t0)}`)
  return refactors
}




import { Node } from 'ts-simple-ast';