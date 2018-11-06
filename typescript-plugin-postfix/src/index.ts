import { findChildContainingPosition, getKindName, printNode, diffAndCreateTextChanges } from 'typescript-ast-util';
import { getPluginCreate } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { getAllPostfix } from './postfixHome';
import { PostfixPredicateOptions } from './types';
import * as ts from 'typescript'

const PLUGIN_NAME = 'typescript-plugin-postfix'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

// let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo
let log

export = getPluginCreate({ getCompletionsAtPosition, getCompletionEntryDetails }, (modules, anInfo) => {
  // ts = modules.typescript
  info = anInfo
  log = function (msg) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})

function getCompletionsAtPosition(fileName: string, position: number,
  options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {

  const predicateArg: PostfixPredicateOptions = {
    fileName, position
  }
  // our completions
  const postFixCompletionEntries = getAllPostfix().filter(p => p.predicate(predicateArg)).map(p => ({
    name: p.config.name,
    kind: p.config.kind || ts.ScriptElementKind.unknown,
    kindModifiers: p.config.kindModifiers,
    sortText: p.config.sortText,
    insertText: ' ', // TODO: hack: If I don't do this then vscode will automatically add `this.name``in the text sourcefile - no matter the implementation - I don't know why or how to disable that besides this
    // replacementSpan: {start: 0, length: 0},//p.config.replacementSpan,
    hasAction: p.config.hasAction,
    source: p.config.source,
    isRecommended: p.config.isRecommended
  } as ts_module.CompletionEntry))

  // prior completions
  let completions:  ts_module.CompletionInfo = info.languageService.getCompletionsAtPosition(fileName, position, options) || {
    entries: [],
    isGlobalCompletion: false, // TODO: not sure about any of these. 
    isMemberCompletion: false,
    isNewIdentifierLocation: false
  }
  log(`${PLUGIN_NAME} getCompletionsAtPosition - completions returned by .languageService.getCompletionsAtPosition are  ${completions ? JSON.stringify(completions) : 'undefined'}  - postFixCompletionEntries: ${JSON.stringify(postFixCompletionEntries)} ${position}`)

  completions.entries = postFixCompletionEntries.concat(completions.entries)  // add postfix completions
  return completions
}


function getCompletionEntryDetails(fileName: string, position: number, name: string, options: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined, source: string | undefined): ts.CompletionEntryDetails {

  const postfix = getAllPostfix().find(p => p.config.name === name)
  if (!postfix) {
    log(`${PLUGIN_NAME} - getCompletionEntryDetails cannot be completed because postfix with name ${name} couldn't be found `)
    return
  }
  // info.project.updateGraph()
  // info.project.registerFileUpdate(fileName)

  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  const target = findChildContainingPosition(sourceFile, position - 1)
  const result = postfix.execute({ program, fileName, position, target, log }) as string

  log(`${PLUGIN_NAME} - getCompletionEntryDetails postfix.execute called with filename: ${fileName}, position: ${position}, target:  ${target && target.getText()} - parent is : ${target.parent.getText()} postfix.execute returned result: 
***
${result}
***`)


  //TODO: we return a codeAction.text change that basically replace all the text with the new one - we could do t better...
  // const changes = diffAndCreateTextChanges(sourceFile.getFullText(), result) 
  return {
    name,
    kind: ts.ScriptElementKind.unknown,
    kindModifiers: '',
    
    displayParts: [
      // { kind: 'keyword', text: 'var' },
      // { kind: 'localName', text: 'nameMePlease' }
    ],
    // documentation: [
    //   {kind: 'keyword', text: 'var'}
    // ],
    // tags: [
    //   {name: 'tag1', text: 'foooo'}
    // ],
    codeActions: [{
      description: 'variable declaration postfix ',
      // commands: [{}],
      changes: [
        {
          fileName,
          textChanges:  diffAndCreateTextChanges(sourceFile.getText(), result) .reverse() // need to reverse it so it works for refactors
            // [
            //   {
            //     newText: result,
            //     span: { start: 0, length: sourceFile.end }
            //   }
            // ]
        }
      ]
    }],
    // source: [
    //   {     
    //      kind: 'keyword', text: 'var'}
    // ]
  }
}



