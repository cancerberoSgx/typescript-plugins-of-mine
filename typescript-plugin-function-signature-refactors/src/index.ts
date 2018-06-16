import { now } from 'hrtime-now';
import * as ts from 'typescript';
import { findAscendant, findChildContainingRangeLight, getNextSibling, getPreviousSibling, positionOrRangeToRange, positionOrRangeToNumber } from 'typescript-ast-util';
// import { basename, dirname, isAbsolute, join } from 'path'
// import Project from 'ts-simple-ast'
import { getPluginCreate, LanguageServiceOptionals, createSimpleASTProject } from 'typescript-plugin-util';
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { SourceFile, TypeGuards, SignaturedDeclaration, NamedNode, Node } from 'ts-simple-ast';
import { reorderParameters } from './reorderParams';

const PLUGIN_NAME = 'typescript-plugin-function-signature-refactors'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

function log (msg: string) {info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`) }

function getFunction(fileName: string, position: number) {
  // TODO: cache
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  const node = findChildContainingRangeLight(sourceFile, positionOrRangeToRange(position))
  if (!node) {
    return
  }
  const expr = findAscendant<ts.ExpressionStatement>(node, ts.isExpressionStatement, true)
  if (!expr) {
    return
  }
  return [getNextSibling(expr), getPreviousSibling(expr)].find(ts.isFunctionLike)
}

/** same as getFunction but in ts-simple-ast project */
function getFunctionSimple(file: SourceFile, position: number, name:string) : SignaturedDeclaration & NamedNode & Node | undefined{
  let expr = file.getDescendantAtPos(position)
  // log([expr].concat(expr.getAncestors()).map(e=>e.getKindName()).join(', '));
  
  const e = [expr].concat(expr.getAncestors()).find(e=>TypeGuards.isSignaturedDeclaration(e) && TypeGuards.isNamedNode(e) && e.getName()===name)
  // const e = [expr.getNextSibling(), expr.getPreviousSibling()].find(e=>TypeGuards.isSignaturedDeclaration(e) && TypeGuards.isNamedNode(e) && e.getName()===name)
  if(TypeGuards.isSignaturedDeclaration(e) && TypeGuards.isNamedNode(e)){
    return e
  }
}

const interactionTool = create({
  prefix: '&%&%',
  log: (msg) => {
    info.project.projectService.logger.info(`${PLUGIN_NAME} interaction-tool ${msg}`) 
  },
  actions: [
    {
      name: 'reorderParams',
      args: ['name', 'reorder'],
      print: action => `Reorder parameters of "${action.args.name}"`,
      snippet: (fileName: string, position: number): string | undefined => {
        let func = getFunction(fileName, position)
        if (!func || func.parameters && func.parameters.length <= 1) {
          return
        }
        const reorder = []
        for (let i = 0; i < func.parameters.length; i++) {
          reorder.push(func.parameters.length - i - 1)
        }
        return `reorderParams("${func.name.getText()}", [${reorder.join(', ')}])
/* Help: The second argument is the new order of parameters. 
For example, [1, 0] means the first and second parameters will be switching. */`
      },

      // TODO: we could give a more intuitive text-based API by letting the user provide the new signature. Then we create a new function with that signature in order to parse it correctly. 
      nameExtra: (fileName: string, position: number) => {
        const func = getFunction(fileName, position)
        return func ? `of ${func.name.getText()}` : ''
      }
    }
  ]
})


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts_module.TextRange, refactorName: string, actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (actionName !== REFACTOR_ACTION_NAME) {
    return refactors
  }
  try {
    const simpleProject = createSimpleASTProject(info.project)
    const sourceFile = simpleProject.getSourceFileOrThrow(fileName)
    const funcDecl = getFunctionSimple(sourceFile, positionOrRangeToNumber(positionOrRange), selectedAction.args.name)
    log(`getEditsForRefactor ${funcDecl&& funcDecl.getKindName()} [${selectedAction.args && selectedAction.args.reorder && selectedAction.args.reorder.join(', ')}] ${funcDecl && funcDecl.getText()}`)
    reorderParameters(funcDecl, selectedAction.args.reorder)
    sourceFile.saveSync()
    // simpleProject.saveSync()
  } catch (error) {
    log(`getEditsForRefactor error ${error + ' - ' + error.stack}`)
    return refactors
  }
  log(`getEditsForRefactor ${selectedAction.name} took  ${(now() - t0) / 1000000}`)
}

function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options)
  if (prior) {
    prior.entries = prior.entries.concat(interactionTool.getCompletionsAtPosition(fileName, position, options))
  }
  return prior
}

let selectedAction:Action
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts.UserPreferences):  ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const result = interactionTool.getApplicableRefactors(info, `${PLUGIN_NAME}-refactor`, REFACTOR_ACTION_NAME, fileName, positionOrRange, userPreferences)
  log(`getApplicableRefactors took ${(now() - t0) / 1000000}`)
  selectedAction =  result.selectedAction
  return result.refactors
}


// let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

const pluginDefinition: LanguageServiceOptionals = {
  getApplicableRefactors, getEditsForRefactor, getCompletionsAtPosition
}
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  // ts = modules.typescript
  info = anInfo
  log(`created`)
})
