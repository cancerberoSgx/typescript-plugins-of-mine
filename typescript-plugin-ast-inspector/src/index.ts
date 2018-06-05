// TODO: use plugin-util
// TODO : log  time 

import { now, timeFrom } from 'hrtime-now';
import { dumpAst, findChildContainingPosition, findChildContainingRange, getKindName, positionOrRangeToNumber, positionOrRangeToRange, printNode } from 'typescript-ast-util';
import { createSimpleASTProject } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { EVAL_CODE_IN_COMMENTS_REFACTOR_ACTION_NAME, EVAL_SELECTION_REFACTOR_ACTION_NAME, EVAL_CURRENT_FUNCTION_BODY_REFACTOR_ACTION_NAME, executeEvalCode } from './evalCode';
import { FormatCodeSettings } from 'typescript';
import { Project } from 'ts-simple-ast';

const PLUGIN_NAME = 'typescript-plugin-ast-inspector'
const PRINT_AST_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-ast-refactor-action`
const PRINT_PARENT_NODES_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-inheritance-refactor-action`
const PRINT_SELECTED_NODE_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-selected-node`

let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo
let log: (mst: string) => void

export = function init(modules: { typescript: typeof ts_module }) {
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

let nodeAtCursor: ts.Node | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences): ts_module.ApplicableRefactorInfo[] {
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences) || []
  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  let actions = [
    { name: EVAL_CODE_IN_COMMENTS_REFACTOR_ACTION_NAME, description: 'Eval code in comments' },
    { name: EVAL_SELECTION_REFACTOR_ACTION_NAME, description: 'Eval selection' },
    { name: EVAL_CURRENT_FUNCTION_BODY_REFACTOR_ACTION_NAME, description: 'Eval current function selection' } // TODO: show only if we are inside a function
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
  if (actionName === PRINT_AST_REFACTOR_ACTION_NAME && nodeAtCursor) {
    return printAst(nodeAtCursor, fileName)
  }
  else if (actionName === PRINT_PARENT_NODES_REFACTOR_ACTION_NAME && nodeAtCursor) {
    return printParentNodes(nodeAtCursor, fileName)
  }
  else if (actionName === EVAL_CODE_IN_COMMENTS_REFACTOR_ACTION_NAME || actionName === EVAL_SELECTION_REFACTOR_ACTION_NAME || actionName === EVAL_CURRENT_FUNCTION_BODY_REFACTOR_ACTION_NAME) {
    return evalCode(fileName, positionOrRange, formatOptions, refactorName, actionName)
  }
}

// let evalCodeGuestEmitter
function evalCode(fileName: string, positionOrRange: number | ts_module.TextRange, formatOptions: ts.FormatCodeSettings, refactorName: string, actionName: string): ts.RefactorEditInfo | undefined {

  // if(!evalCodeGuestEmitter){
  //   evalCodeGuestEmitter =(global as any).guestEmitter
  //   evalCodeGuestEmitter.on('requestEvalCurrentFunctionSelection', (fileName, position,  name, options, source)=>{
    // })
    // c.util.hostEmitter.on('getCompletionEntryDetails', ( fileName, position,  name, options, source) =>{
    //   c.util.guestEmitter.emit('requestEvalCurrentFunctionSelection', 1684, fileName, position,  name, options, source)
    // } )
       // hostEmitter.emit('getCompletionEntryDetails', ileName: string, position: number, name: string,
      // options: ts
  // }

  
  const t0 = now()
  const createSimpleASTProjectT0 = now()
  const simpleProject = createSimpleASTProject(info.project)
  const sourceFile = simpleProject.getSourceFile(fileName)
  const simpleNode = sourceFile.getDescendantAtPos(positionOrRangeToNumber(positionOrRange)) || sourceFile
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode createSimpleASTProject took ${timeFrom(createSimpleASTProjectT0)}`)
  const fixapplyT0 = now()
  try {
    executeEvalCode({ log, node: simpleNode, fileName, info, positionOrRange, formatOptions, refactorName, actionName, project: simpleProject })
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode executeEvalCode error ${error} \n ${error.stack}`)
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode executeEvalCode took ${timeFrom(fixapplyT0)}`)
  const saveSyncT0 = now()
  // sourceFile.emit() 
  simpleProject.saveSync()
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode saveSync took ${timeFrom(saveSyncT0)}`)
  info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode total time took ${timeFrom(t0)}`)
  return
}

function printAst(nodeAtCursor: ts.Node, fileName: string): ts.RefactorEditInfo {
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

function printParentNodes(nodeAtCursor: ts.Node, fileName: string): ts.RefactorEditInfo {
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
    return printNode(n, -1, level++) + ', starts: '+n.getStart()
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