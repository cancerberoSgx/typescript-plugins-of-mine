import { now, timeFrom } from 'hrtime-now';
import {
  findChildContainedRange, findChildContainingRange, getKindName, positionOrRangeToNumber, findChild,
  positionOrRangeToRange, findChildContainingPosition, printNode
} from 'typescript-ast-util';
import { getPluginCreate, createSimpleASTProject } from 'typescript-plugin-util'
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { getAllPostfix } from './postfixHome';
import { PostfixPredicateOptions } from './types';
import { ScriptElementKindModifier } from 'typescript';
import { EventEmitter } from 'events';

const PLUGIN_NAME = 'typescript-plugin-postfix'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo
let log

const pluginDefinition = {
  // getApplicableRefactors, getEditsForRefactor, 
  getCompletionsAtPosition, getCompletionEntryDetails
}

export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  log = function (msg) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})


function getCompletionEntryDetails(fileName: string, position: number, name: string,
  options: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined, source: string | undefined)
  : ts.CompletionEntryDetails {

  if(!hostEmitter){ // an experiment to see if we can communicate more directly with evalCode plugin so we pass the real data and he can do simulations
    hostEmitter = (global as any ).hostEmitter as EventEmitter
  }
  if(hostEmitter){
    hostEmitter.emit('getCompletionEntryDetails', fileName, position,  name, options, source)
  }

  log(`${PLUGIN_NAME} - getCompletionEntryDetails called ${fileName} name: ${name} options: ${JSON.stringify(options || {})} ${source} `)

  const minimalCompletionEntryDetails: ts.CompletionEntryDetails = {
    name,
    kind: ts.ScriptElementKind.unknown,
    kindModifiers: '',
    displayParts: [],
    documentation: [],
    tags: [],
    codeActions: [],
    source: []
  }
  const postfix = getAllPostfix().find(p => p.config.name === name)
  if (!postfix) {
    log(`${PLUGIN_NAME} - getCompletionEntryDetails cannot be completed because postfix with name ${name} couldn't be found `)
    return minimalCompletionEntryDetails
  }
  
  log(`${PLUGIN_NAME} - getCompletionEntryDetails postfix.execute called with filename: ${fileName}, position: ${position}, target:  ${target&&printNode(target)}`)
  const result = postfix.execute({ program: info.languageService.getProgram(), fileName, position, target }) as string
  log(`${PLUGIN_NAME} - getCompletionEntryDetails postfix.execute returned result ==  ${result}`)


  const simpleProject = createSimpleASTProject(info.project)
  const sourceFile = simpleProject.getSourceFile(fileName)
  sourceFile.replaceWithText(result)
  // const simpleNode = sourceFile.getDescendantAtPos(positionOrRangeToNumber(positionOrRange)) || sourceFile
  // info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode createSimpleASTProject took ${timeFrom(createSimpleASTProjectT0)}`)
  // const fixapplyT0 = now()
  // try {
    // executeEvalCode({ log, node: simpleNode, fileName, info, positionOrRange, formatOptions, refactorName, actionName })
  // } catch (error) {
    // info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode executeEvalCode error ${error} \n ${error.stack}`)
  // }
  // info.project.projectService.logger.info(`${PLUGIN_NAME} evalCode executeEvalCode took ${timeFrom(fixapplyT0)}`)
  // const saveSyncT0 = now()
  // sourceFile.emit()
  simpleProject.saveSync()


}


let hostEmitter : EventEmitter 

let target: ts.Node

function getCompletionsAtPosition(fileName: string, position: number,
  options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {

  log(`${PLUGIN_NAME} - getCompletionsAtPosition called `)

  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  target = findChildContainingPosition(sourceFile, position)

  const predicateArg: PostfixPredicateOptions = {
    fileName, position, target
  }

  // our completions
  const postFixCompletionEntries = getAllPostfix().filter(p => p.predicate(predicateArg)).map(p => ({
    name: p.config.name || p.config.name || p.completion(),
    kind: p.config.kind,
    kindModifiers: p.config.kindModifiers,
    sortText: p.config.sortText || p.config.name ||  p.completion(),
    insertText: p.config.insertText || p.completion(),
    replacementSpan: p.config.replacementSpan,
    hasAction: p.config.hasAction,
    source: p.config.source,
    isRecommended: p.config.isRecommended
  } as ts_module.CompletionEntry))

  // prior completions
  let completions = info.languageService.getCompletionsAtPosition(fileName, position, { includeInsertTextCompletions: true, includeExternalModuleExports: true })
  log(`${PLUGIN_NAME} getCompletionsAtPosition - completions returned by .languageService.getCompletionsAtPosition are  ${completions ? JSON.stringify(completions) :  'undefined'}`)

  completions = completions || {
    entries: [],
    isGlobalCompletion: true, // TODO: not sure about any of these. 
    isMemberCompletion: true,
    isNewIdentifierLocation: true
  }

  log(`${PLUGIN_NAME} getCompletionsAtPosition - postFixCompletionEntries added ${postFixCompletionEntries ? postFixCompletionEntries.length : 'undefined'}`)
  completions.entries = postFixCompletionEntries.concat(completions.entries)
  return completions
}


// function getCompletionEntrySymbol(fileName: string, position: number, name: string, source: string | undefined): Symbol{
//   log(`${PLUGIN_NAME} - getCompletionEntrySymbol called `)
//   return null
// }


// function  getCombinedCodeFix(scope: ts_module.CombinedCodeFixScope, fixId: {}, formatOptions: ts_module.FormatCodeSettings): ts_module.CombinedCodeActions{
//   info.project.projectService.logger.info(`getCombinedCodeFixPositionajsjsjsjs`)
//   return null
// }
// function getCodeFixesAtPosition (fileName: string, start: number, end: number, errorCodes: ReadonlyArray<number>, formatOptions: ts_module.FormatCodeSettings): Array<ts_module.CodeFixAction>{

//   info.project.projectService.logger.info(`getCodeFixesAtPositionajsjsjsjs`)
//   return null
// }





// // let target: CodeFixOptions
// function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
//   : ts.ApplicableRefactorInfo[] {
//   const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
//   return refactors
// }

// function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
//   positionOrRange: number | ts.TextRange, refactorName: string,
//   actionName: string): ts.RefactorEditInfo | undefined {
//   const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
//   return refactors
// }




