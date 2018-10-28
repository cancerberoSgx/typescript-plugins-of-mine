import { now } from 'hrtime-now';
import { basename, dirname, isAbsolute, join } from 'path';
import Project, { RegularExpressionLiteral } from 'ts-simple-ast';
import { LanguageServiceOptionals, getPluginCreate } from 'typescript-plugin-util';
import { createSimpleASTProject } from 'ts-simple-ast-extra';
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { getInputConsumer, setLogger, InputConsumer } from 'input-ui-ipc-provider';
import { moveNode } from './moveNode';

const PLUGIN_NAME = 'typescript-plugin-move-declaration'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

const interactionTool = create({
  prefix: '&%&%',
  actions: [
    {
      name: 'moveDeclarationNamed',
      args: ['declarationName', 'dest'],
      print: (action) => `Move "${action.args.declarationName}" to file ${action.args.dest}`,
      snippet: 'moveDeclarationNamed(\'SomeClass\', \'../other/file.ts\')'
    }
  ]
})

let selectedAction: Action
// let inputConsumer: InputConsumer
// let inputConsumerAsked: boolean
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences)

  : ts.ApplicableRefactorInfo[] {
  const t0 = now()
  // inputConsumer = getInputConsumer()
  // inputConsumer.askSupported().then(()=>inputConsumerAsked=true)
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences) || []
  const program = info.languageService.getProgram()
  const sourceFile = program.getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  const actions = interactionTool.findActions(sourceFile.getText())
  if (!actions || actions.length === 0) {
    return refactors
  }
  selectedAction = actions[0]
  const refactorActions = [{ name: REFACTOR_ACTION_NAME, description: selectedAction.print(selectedAction) }]
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'move-declaration',
    actions: refactorActions
  })
  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${(now() - t0) / 1000000}`)
  return refactors
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor sebaseba0`)
  if (actionName !== REFACTOR_ACTION_NAME) {
    return refactors
  }
  try {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor sebaseba1`)
    const dest2 = selectedAction.args.dest
    const declarationName =  selectedAction.args.declarationName
    // getUserInput().then(({ dest2, declarationName }) => {

      info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor sebaseba2 ${dest2}, ${declarationName}`)

      const simpleProject = createSimpleASTProject(info.project)
      const sourceFile = simpleProject.getSourceFileOrThrow(fileName)
      let dest: string = isAbsolute(dest2) ? dest2 :
        join(dirname(fileName), dest2)
      const targetFile = simpleProject.getSourceFile(dest) || simpleProject.createSourceFile(dest, '')
      info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor moveDeclarationNamed ${selectedAction.args.declarationName}, ${sourceFile.getFilePath()}, ${targetFile.getFilePath()}`)

      const declarationToMove = sourceFile.getClass(selectedAction.args.declarationName) || 
        sourceFile.getInterface(selectedAction.args.declarationName) || 
        sourceFile.getFunction(selectedAction.args.declarationName)

      moveNode(declarationToMove, targetFile)

      simpleProject.saveSync()
    // })
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error  ${selectedAction.name} ${error + ' - ' + error.stack}`)
    return refactors
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor ${selectedAction.name} took  ${(now() - t0) / 1000000}`)
}
// function getUserInput(): Promise<{ dest2: string, declarationName: string }> {
//   return Promise.resolve({ dest2: selectedAction.args.dest, declarationName: selectedAction.args.declarationName })
  
// }
function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
  if (prior) {
    prior.entries = prior.entries.concat(interactionTool.getCompletionsAtPosition(fileName, position, options))
  }
  return prior;
};


let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

const pluginDefinition: LanguageServiceOptionals = {
  getApplicableRefactors, getEditsForRefactor, getCompletionsAtPosition
}

export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  ts = modules.typescript
  info = anInfo
  info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
})
