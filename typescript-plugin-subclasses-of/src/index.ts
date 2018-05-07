import * as ts_module from '../node_modules/typescript/lib/tsserverlibrary'
import { findChildContainingPosition, findParent, positionOrRangeToNumber, positionOrRangeToRange, findParentFromPosition, dumpAst, getKindName } from 'typescript-ast-util'
import { getAllReferencesToSymbolInPosition, findDefinitionsToSymbolAtPosition } from './subclass-finder';

const PLUGIN_NAME = 'typescript-plugin-subclasses-of'
const ACTION_NAME_DIRECT_SUBCLASSES = `${PLUGIN_NAME}-direct-subclasses-refactor-action`
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

let selectedDef: ts.ReferencedSymbol|undefined
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts_module.ApplicableRefactorInfo[] {
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []

  const refs = info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange))
  if (!refs || !refs.length) {
    return refactors
  }
  selectedDef = refs.find(r => !!(r.definition&&r.definition.kind===ts.ScriptElementKind.classElement))
  if (!selectedDef) {
    return refactors
  }
  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  const actions = []
  actions.push({ name: ACTION_NAME_DIRECT_SUBCLASSES, description: 'Show Direct Subclasses of ' + selectedDef.definition.name })
  const refactorInfo: ts_module.ApplicableRefactorInfo = {
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Subclasses of',
    actions
  }
  refactors.push(refactorInfo)
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string)
  : ts.RefactorEditInfo | undefined {

  
  // let targetNode, newText
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)

  if (!selectedDef||actionName != ACTION_NAME_DIRECT_SUBCLASSES) {
    return refactors;
  }
  

  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  const newText =  selectedDef.definition.fileName + ' ' +sourceFile.getLineAndCharacterOfPosition(selectedDef.definition.textSpan.start).line
  // sourceFile.getLineAndCharacterOfPosition(pos)
  // const newText = findDefinitionsToSymbolAtPosition(sourceFile, info, positionOrRange);
  //  if ( newText) {
  return {
    edits: [{
      fileName,
      textChanges: [{
        span: { start: sourceFile.getEnd(), length: newText.length }, // add it right after the class decl
        newText: newText
      }],
    }],
    renameFilename: undefined,
    renameLocation: undefined,
  }
  //  }

  // find the first parent that is a class declaration starting from given position
  // targetNode = findParentFromPosition(info, fileName, positionOrRange, 
  //   parent => parent.kind === ts.SyntaxKind.ClassDeclaration)
  // try {


  // // newText = getAllReferencesToSymbolInPosition(targetNode as ts_module.ClassDeclaration, info, true, positionOrRange)
  // // console.log(
  //   newText = findDefinitionsToSymbolAtPosition(sourceFile, info, positionOrRange );


  // } catch (error) {
  //   newText=error+' ' + error.stack 
  // }



  // else {
  //   return 
  // }

}