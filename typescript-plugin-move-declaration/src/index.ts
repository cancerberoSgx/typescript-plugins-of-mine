import { now } from 'hrtime-now';
import { basename, dirname, isAbsolute, join } from 'path';
import Project, { RegularExpressionLiteral } from 'ts-simple-ast';
import { LanguageServiceOptionals, getPluginCreate, createSimpleASTProject } from 'typescript-plugin-util';
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { moveDeclarationNamed } from './moveDeclaration';
import { getInputConsumer, setLogger, InputConsumer } from 'input-ui-ipc-provider';

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
let inputConsumer: InputConsumer
// let inputConsumerAsked: boolean
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences)

  : ts.ApplicableRefactorInfo[] {
  const t0 = now()
  inputConsumer = getInputConsumer()
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
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor sebaseba1` )
 getUserInput().then( ({dest2, declarationName} )=>{

  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor sebaseba2 ${dest2}, ${declarationName}`)

  const simpleProject = createSimpleASTProject(info.project)
  const sourceFile = simpleProject.getSourceFileOrThrow(fileName)
  let dest: string = isAbsolute(dest2) ? dest2 :
    join(dirname(fileName), dest2)
  const targetFile = simpleProject.getSourceFile(dest)
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor moveDeclarationNamed ${selectedAction.args.declarationName}, ${sourceFile.getFilePath()}, ${targetFile.getFilePath()}`)
  moveDeclarationNamed(selectedAction.args.declarationName, sourceFile, simpleProject, targetFile)
  info.languageService.getEmitOutput(sourceFile.getFilePath())
  info.languageService.getEmitOutput(targetFile.getFilePath())
  simpleProject.saveSync()

  
    })
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error  ${selectedAction.name} ${error + ' - ' + error.stack}`)
    return refactors
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor ${selectedAction.name} took  ${(now() - t0) / 1000000}`)
}
function getUserInput(): Promise<{dest2: string, declarationName: string}> {
  return inputConsumer.askSupported().then(support=>{
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor sebaseba3 ${support.inputText}` )
    if(!support.inputText){
      return Promise.resolve({dest2: selectedAction.args.dest , declarationName: selectedAction.args.declarationName })
    }
    const result: {dest2: string, declarationName: string} = {dest2: '', declarationName: ''}
    return inputConsumer.inputText({prompt: 'Please enter name of the declaration to move', value: 'UnaAhi' , })//TODO: input validation - exists and is first level
    .then(response=>{result.declarationName=response.answer; return Promise.resolve(response.answer)})
    .then(declarationName=>inputConsumer.inputText({prompt: 'Please enter the target file path where you want to move '+declarationName, value: '../oneFile.ts' , }))
    .then(response=>{result.dest2=response.answer; return Promise.resolve(result)})
  })
}
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
