import { now } from 'hrtime-now';
import { basename, dirname, isAbsolute, join } from 'path';
import { LanguageServiceOptionals, createSimpleASTProject, getPluginCreate } from 'typescript-plugin-util';
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';

const PLUGIN_NAME = 'typescript-plugin-move-file'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

const interactionTool = create({
  prefix: '&%&%',
  actions: [
    {
      name: 'moveThisFileTo',
      args: ['dest'],
      print: (action) => `Move this file to ${action.args.dest}`,
      snippet: 'moveThisFileTo(\'../newName.ts\')'
    },
    {
      name: 'moveThisFolderTo',
      args: ['dest'],
      print: (action) => `Move this folder to ${action.args.dest}`,
      snippet: 'moveThisFolderTo(\'../newName\')'
    }
  ]
})

let selectedAction: Action

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts.ApplicableRefactorInfo[] {
  const t0 = now()
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
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
  const refactorActions = [{ name: REFACTOR_ACTION_NAME + '-' + selectedAction.name, description: selectedAction.print(selectedAction) }]
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'move-file-action',
    actions: refactorActions
  })
  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${printTime(now() - t0)}`)
  return refactors
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (!actionName.startsWith(REFACTOR_ACTION_NAME) || !selectedAction) {
    return refactors
  }
  try {
    // TODO: could we maintain a simple-ast Project in a variable and next time just refresh it so is faster ? 
    const createSimpleASTProjectT0 = now()
    const simpleProject = createSimpleASTProject(info.project)
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor createSimpleASTProject() took  ${printTime(now() - createSimpleASTProjectT0)}`)
    
    if ((selectedAction.name === 'moveThisFileTo' || selectedAction.name === 'moveThisFolderTo') && selectedAction.args.dest) {
      // make it absolute
      let dest: string = isAbsolute(selectedAction.args.dest) ? selectedAction.args.dest :
        join(selectedAction.args.dest.endsWith('.ts') ? dirname(fileName) : fileName,
          selectedAction.name === 'moveThisFolderTo' ? '..' : '.',
          selectedAction.args.dest)
      dest = dest.endsWith('.ts') ? dest : join(dest, basename(fileName))
      dest = selectedAction.name === 'moveThisFolderTo' ? join(dest, '..') : dest
      const sourceFileName = selectedAction.name === 'moveThisFolderTo' ? join(fileName, '..') : fileName
      info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor ${selectedAction.name} moving ${fileName} to ${dest}`)

      const moveSaveEmitT0 = now()
      if (selectedAction.name === 'moveThisFileTo') {
        simpleProject.getSourceFileOrThrow(sourceFileName).moveImmediatelySync(dest)
      }
      else if (selectedAction.name === 'moveThisFolderTo') {
        simpleProject.getDirectoryOrThrow(sourceFileName).moveImmediatelySync(dest)
      }
      simpleProject.saveSync()
      simpleProject.emit()
      info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor moveSaveEmit took  ${printTime(now() - moveSaveEmitT0)}`)
      
    }
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error  ${selectedAction.name} ${error + ' - ' + error.stack}`)
    return refactors
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor ${selectedAction.name} took  ${printTime(now() - t0)}`)
}

function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
  prior.entries = prior.entries.concat(interactionTool.getCompletionsAtPosition(fileName, position, options))
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



import prettyMs from 'pretty-ms'
function printTime(ns:number):string{
  return prettyMs(ns/1000000)
}
