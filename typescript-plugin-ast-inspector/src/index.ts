// Extract interface from a class declaration. Write it just before the class declaration and make the class implement it. Only members with "public" modifier will be extracted
//
// **Screencast**: 
// 
// ![See it in action](../plugin-screencast.gif)

import { findParentFromPosition, positionOrRangeToNumber, findChildContainingPosition, getKindName, dumpAst, positionOrRangeToRange, findChildContainingRange, printNode } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';

const PLUGIN_NAME = 'typescript-plugin-print-ast'
const PRINT_AST_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-ast-refactor-action`
const PRINT_PARENT_NODES_REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-print-inheritance-refactor-action`
// IDEA oterh action that prints nodeAtCursor.arent.parent.arent to the top so I know where I'm standings

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
  nodeAtCursor = findChildContainingRange(sourceFile, positionOrRangeToRange(positionOrRange))
  if (!nodeAtCursor) {
    return refactors
  }
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Extract interface',
    actions: [
      { name: PRINT_AST_REFACTOR_ACTION_NAME, description: 'Print AST of selected ' + getKindName(nodeAtCursor.kind) },
      { name: PRINT_PARENT_NODES_REFACTOR_ACTION_NAME, description: 'Print parent nodes of selected ' + getKindName(nodeAtCursor.kind) }
    ],
  })
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {

  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if ((actionName != PRINT_AST_REFACTOR_ACTION_NAME && actionName != PRINT_PARENT_NODES_REFACTOR_ACTION_NAME) || !nodeAtCursor) {
    return refactors
  }
  let newText = ''
  if (actionName === PRINT_AST_REFACTOR_ACTION_NAME) {
    newText = `\`
AST of selected ${getKindName(nodeAtCursor.kind)}:  
${dumpAst(nodeAtCursor)}
\``
  }
  else{
    let node: ts.Node | undefined = nodeAtCursor
    const arr = []
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
  }
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

