// Extract interface from a class declaration. Write it just before the class declaration and make the class implement it. Only members with "public" modifier will be extracted
//
// **Screencast**: 
// 
// ![See it in action](../plugin-screencast.gif)

import { findParentFromPosition, positionOrRangeToNumber } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { extractInterface } from './extract-interface';

const PLUGIN_NAME = 'typescript-plugin-extract-interface'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

function init(modules: { typescript: typeof ts_module }) {
  ts = modules.typescript

  function create(anInfo: ts_module.server.PluginCreateInfo) {
    info = anInfo
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)

    // initialize proxy 
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


let selectedDef: ts.ReferencedSymbol | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange): ts_module.ApplicableRefactorInfo[] {
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
    description: 'Extract interface',
    actions: [
      { name: REFACTOR_ACTION_NAME, description: 'Extract interface from ' + selectedDef.definition.name },
      // { name: 'print-ast', description: 'Print AST' } // TODO: remove print ast to its own project
    ],
  })
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {

  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (actionName != REFACTOR_ACTION_NAME) {
    return refactors

  }
  // else if (actionName == 'print-ast') { // TODO: remove print ast to its own project
  //   targetNode = findParentFromPosition(info, fileName, positionOrRange, parent => true)
  //   newText = '\n`' + dumpAst(targetNode) + '`\n'
  // }

  // find the first parent that is a class declaration starting from given position
  const targetNode = findParentFromPosition(info, fileName, positionOrRange,
    parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
  const newText = extractInterface(targetNode as ts_module.ClassDeclaration)
  if (targetNode && newText) {
    return {
      edits: [{
        fileName,
        textChanges: [{
          span: { start: targetNode.getSourceFile().getEnd(), length: newText.length }, // add it right after the class decl
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