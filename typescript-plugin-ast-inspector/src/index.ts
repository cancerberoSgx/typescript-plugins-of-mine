
import { findParentFromPosition, positionOrRangeToNumber, findChildContainingPosition, getKindName, dumpAst, positionOrRangeToRange, findChildContainingRange, printNode, findChildContainedRange, getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { now, timeFrom } from 'hrtime-now';
import { Project } from 'ts-simple-ast';
import { createSimpleASTProject, getPluginCreate } from 'typescript-plugin-util';
import { CodeFix, CodeFixOptions, executeEvalCode } from './evalCode';

const PLUGIN_NAME = 'typescript-plugin-ast-inspector'
const PRINT_AST_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-ast-refactor-action`
const PRINT_PARENT_NODES_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-inheritance-refactor-action`
const PRINT_SELECTED_NODE_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-selected-node`
const EVAL_CODE_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-eval-code`


let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo
let log: (mst: string) => void


// TODO: use plugin-util
// TODO : log  time 

function init(modules: { typescript: typeof ts_module }) {
  ts = modules.typescript

  function create(anInfo: ts_module.server.PluginCreateInfo) {
    info = anInfo
    log = function (msg) {
      info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
    }
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }
    proxy.getApplicableRefactors = getApplicableRefactors
    proxy.getEditsForRefactor = getEditsForRefactor

    return proxy
  }
  return { create }
}

export = init

let nodeAtCursor: ts.Node | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange): ts_module.ApplicableRefactorInfo[] {
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }

  let actions = [
    { name: EVAL_CODE_REFACTOR_ACTION_NAME, description: 'Eval code' }
  ]
  nodeAtCursor = findChildContainingRange(sourceFile, positionOrRangeToRange(positionOrRange))
  if (!nodeAtCursor) {
    nodeAtCursor = findChildContainingPosition(sourceFile, positionOrRangeToNumber(positionOrRange))
  }
  if (!nodeAtCursor) {
    return refactors
  }

  actions = actions.concat([
    { name: PRINT_AST_REFACTOR_ACTION_NAME, description: 'Print AST of selected ' + getKindName(nodeAtCursor.kind) },
    { name: PRINT_PARENT_NODES_REFACTOR_ACTION_NAME, description: 'Print parent nodes of selected ' + getKindName(nodeAtCursor.kind) }
  ])
  refactors.push({
    name: `${PLUGIN_NAME}-ast-inspector`,
    description: 'ast-inspector',
    actions
  })
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {

  if (actionName === PRINT_AST_REFACTOR_ACTION_NAME&& nodeAtCursor) {
    return printAst(nodeAtCursor, fileName)
  }
  else if (actionName === PRINT_PARENT_NODES_REFACTOR_ACTION_NAME && nodeAtCursor) {
    return printParentNodes(nodeAtCursor, fileName)
  }
  else if (actionName === EVAL_CODE_REFACTOR_ACTION_NAME) {
    return evalCode(fileName, positionOrRange, formatOptions, refactorName, actionName)
  }
}


function evalCode(fileName: string, positionOrRange: number | ts_module.TextRange, formatOptions: ts.FormatCodeSettings, refactorName: string, actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()
  // const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  let simpleProject: Project
  const createSimpleASTProjectT0 = now()
  simpleProject = createSimpleASTProject(info.project)
  const sourceFile = simpleProject.getSourceFile(fileName)
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode createSimpleASTProject took ${timeFrom(createSimpleASTProjectT0)}`)

  const getDiagnosticT0 = now()
  const program = info.languageService.getProgram()
  if (!sourceFile) {
    return 
  }
  // getDiagnosticsInCurrentLocation(program, )
  const diagnostics = ts.getPreEmitDiagnostics(program, program.getSourceFile(fileName))
  info.project.projectService.logger.info(`${PLUGIN_NAME} getPreEmitDiagnostics took ${timeFrom(getDiagnosticT0)}`)

  let containingTarget = findChildContainingRange(sourceFile.compilerNode, positionOrRangeToRange(positionOrRange)) || sourceFile.compilerNode
  const containedTarget = findChildContainedRange(sourceFile.compilerNode, positionOrRangeToRange(positionOrRange)) || sourceFile.compilerNode
  const target: CodeFixOptions = { diagnostics, log, program, containingTarget, containedTarget }

  const simpleNodeT0 = now()
  target.simpleNode = sourceFile.getDescendantAtPos(positionOrRangeToNumber(positionOrRange)) || sourceFile
  if (!target.simpleNode) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} no evalCode because sourceFile is null for fileName=== ${fileName}, actionName == ${actionName}`)
    return
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode first getSourceFile() and simpleNode took ${timeFrom(simpleNodeT0)} and node.kind is ${target.simpleNode.getKindName()}`)

  const fixapplyT0 = now()
  try {
    executeEvalCode(target)
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode executeEvalCode error ${error} \n ${error.stack}`)
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode executeEvalCode took ${timeFrom(fixapplyT0)}`)

  const saveSyncT0 = now()
  simpleProject.saveSync()
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode saveSync took ${timeFrom(saveSyncT0)}`)
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode total time took ${timeFrom(t0)}`)
  return 
}


function printAst(nodeAtCursor: ts.Node, fileName: string): ts.RefactorEditInfo{
  let newText = `\`
AST of selected ${getKindName(nodeAtCursor.kind)}:  
${dumpAst(nodeAtCursor)}
\``
  return {
    edits: [{
      fileName,
      textChanges: [{
        span: { start: nodeAtCursor.getSourceFile().getEnd(), length: newText.length }, // add it right after the class decl
        newText: newText
      }],
    }],
    renameFilename: undefined,
    renameLocation: undefined,
  }
}
function printParentNodes(nodeAtCursor: ts.Node, fileName: string): ts.RefactorEditInfo{
  let node: ts.Node | undefined = nodeAtCursor
  const arr = []
  let newText = ''
  newText += `\nParent AST Nodes of selected ${getKindName(nodeAtCursor.kind)}:\n`
  do {
    if (!node) { break }
    arr.push(node)
    node = node.parent
  } while (node)
  let level = 1
  newText += arr.reverse().map(n => {
    return printNode(n, -1, level++)
  }).join('\n')
  newText = '\n`\n' + newText + '\n`\n'

  return {
    edits: [{
      fileName,
      textChanges: [{
        span: { start: nodeAtCursor.getSourceFile().getEnd(), length: newText.length }, // add it right after the class decl
        newText: newText
      }],
    }],
    renameFilename: undefined,
    renameLocation: undefined,
  }
}