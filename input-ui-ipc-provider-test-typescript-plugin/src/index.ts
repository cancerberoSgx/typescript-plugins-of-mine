import * as ts from 'typescript';
import { getPluginCreate, LanguageServiceOptionals, createSimpleASTProject } from 'typescript-plugin-util';
import { positionOrRangeToNumber } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
// import { getInputConsumer, setLogger } from './inputConsumer';
import { InputConsumer, InputTextResponse, getInputConsumer, setLogger } from 'input-ui-ipc-provider';

const PLUGIN_NAME = 'input-ui-ipc-provider-test-typescript-plugin'

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts.UserPreferences): ts.ApplicableRefactorInfo[] {
  let refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences)
  if (!inputConsumerReady) {
    return refactors
  }
  refactors.push({
    name: `${PLUGIN_NAME}-refactor`,
    description: `${PLUGIN_NAME}-description`,
    actions: [
      { name: `${PLUGIN_NAME}-action-inputText`, description: 'inputText' },
      { name: `${PLUGIN_NAME}-action-messageBox`, description: 'messageBox' },
      { name: `${PLUGIN_NAME}-action-selectText`, description: 'selectText' }
    ]
  })
  return refactors
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts_module.TextRange, refactorName: string, actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (!actionName.startsWith(PLUGIN_NAME) || !inputConsumerReady) {
    return refactors
  }
  if (actionName === `${PLUGIN_NAME}-action-inputText`) {
    inputConsumer.inputText({ prompt: 'Please enter your name', placeHolder: 'John Doe' })
      .then(response=>{
        printInFile(fileName, positionOrRange, `Thank you, ${response.answer}, have a nice day`)
      })
  }
  else if (actionName === `${PLUGIN_NAME}-action-messageBox`) {
    inputConsumer.messageBox({ message: 'Welcome to refactors' })
      .then(response=>{
        printInFile(fileName, positionOrRange, response.answer ? 'user clicked OK' : 'user dismissed the dialog')
      })
  }
  else if (actionName === `${PLUGIN_NAME}-action-selectText`) {
    inputConsumer
    .inputText({ prompt: 'Please enter [from, to] to select', placeHolder: '{"from": 2, "to": 23}' })
    .then(response=> inputConsumer.selectText(JSON.parse(response.answer)))
    .then(response=> printInFile(fileName, positionOrRange, `Text selected, can you see it ? `))
    .catch(ex=> printInFile(fileName, positionOrRange, `ERROR parsing input json text ${ex}`))
  }
  return refactors
}


function printInFile(fileName: string, positionOrRange: number | ts_module.TextRange, s: string) {
  const project = createSimpleASTProject(info.project)
  const sourceFile = project.getSourceFile(fileName)
  sourceFile.insertText(positionOrRangeToNumber(positionOrRange), `/* ${s} */` )
  sourceFile.saveSync()
}


let info: ts_module.server.PluginCreateInfo
const pluginDefinition: LanguageServiceOptionals = {
  getApplicableRefactors, getEditsForRefactor
}
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  info = anInfo
  log = (msg: string) => info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
  log(`created`)
  initInputConsumer()
})
let log: (msg: string)=>void
let inputConsumerReady = false
let inputConsumer: InputConsumer
function initInputConsumer(){
  setLogger(log)
  inputConsumer = getInputConsumer()
  inputConsumer.askSupported().then(() => inputConsumerReady = true)
}