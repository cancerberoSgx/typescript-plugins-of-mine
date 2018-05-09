import { now } from 'hrtime-now';
import { findChild, findChildContainingRange, findIdentifier, getKindName, getTypeStringFor, 
  hasDeclaredType, positionOrRangeToRange, isDeclaration, getTypeStringForDeclarations } from 'typescript-ast-util';
import { getPluginCreate } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';

const PLUGIN_NAME = 'typescript-plugin-add-type'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`
let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }

export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})


let target: ts.Node | undefined



function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  target = undefined
  const node = findChildContainingRange(sourceFile, positionOrRangeToRange(positionOrRange))
  if (!node) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} no getEditsForRefactor because findChildContainedRange undefined`)
    return refactors
  }
  const noFilters = false

  if (noFilters) {
    target = node
  } else {
    const predicate = function isDeclarationWithNoDeclaredType(node: ts.Node, program: ts.Program): boolean {
      return isDeclaration(node) && !hasDeclaredType(node, program) // declaration without a type declaration 
      /*hasName(node) && */
    }
    // target = predicate(node, program) && node
    let child
    target = predicate(node, program) ? node : 
      predicate(node.parent, program) ? node.parent : 
        (child = findChild(node, c => predicate(c, program), false)) ? child : 
          // (child = findChild(node.parent, c => predicate(c, program), false)) ? child : 
            undefined
   
  }
  if(!target){
    info.project.projectService.logger.info(`${PLUGIN_NAME} no getEditsForRefactor because target not found undefined`)
    return refactors
  }
  const name = (node as ts.NamedDeclaration).name && (target as ts.NamedDeclaration).name.getText() || ''
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Add type',
    actions: [
      { name: REFACTOR_ACTION_NAME, description: 'Add type to ' + getKindName(target.kind).replace(/Declaration/gi, '').toLowerCase() + ' "' + name + '"' }
    ],
  })
  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${now() - t0}`)
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (actionName != REFACTOR_ACTION_NAME || !target) {
    return refactors
  }
  const textChange = getFileTextChanges(target, info.languageService.getProgram())
  const refactorEditInfo: ts.RefactorEditInfo = {
    edits: [{
      fileName,
      textChanges: [textChange],
    }],
    renameFilename: undefined,
    renameLocation: undefined,
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor took ${now() - t0}`)
  return refactorEditInfo
}


/**
 * besides correcting type strings like getTypeStringForDeclaration, should this be in plugin-util ? 
 * some cases to consider: 
  // function f ()$TYPE {}
  // function()$TYPE {} // should not enter because of no name
  // method()$TYPE {}
  // class C { property1$TYPE = 2 }
  // class C {property1$TYPE = 'va'}
  // var a$TYPE = 2
  // function(param1$TYPE, param2){}
  // each((c) $TYPE => true)
  // each((c$TYPE)  => true)
 */
 function getFileTextChanges(node: ts.Node, program: ts.Program): ts.TextChange {
  let newText = ': '+getTypeStringForDeclarations(node, program)
  let start = (findIdentifier(node) || node).getEnd() // this will work for variable declaration and non-declaration nodes
  let length = 0

  if (ts.isFunctionLike(node)) {
    // const idEnd = (node as ts.FunctionDeclaration).name ? (node as ts.FunctionDeclaration).name.end :
    // (node as ts.FunctionDeclaration).name
    start = (node as ts.FunctionDeclaration).parameters.end+1
    // length=3
  }
  else/*if(!isDeclaration(node) || ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node))*/{
    //do nothing, default value for newText seems to be doing fine
  }

  return { newText, span: { start, length } }
}

