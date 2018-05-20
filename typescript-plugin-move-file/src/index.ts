import { now } from 'hrtime-now';
import { basename, dirname, isAbsolute, join } from 'path';
import Project from 'ts-simple-ast';
import { LanguageServiceOptionals, getPluginCreate } from 'typescript-plugin-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { Action, create } from 'typescript-plugins-text-based-user-interaction';

const PLUGIN_NAME = 'typescript-plugin-move-file'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

const guiNoMore = create({
  prefix: '&%&%',
  actions: [
    {
      name: 'moveThisFileTo',
      args: ['dest'],
      print: (action)=>`Move this file to ${action.args.dest}`,
      snippet: 'moveThisFileTo(\'../newName.ts\')'
    },
    {
      name: 'moveThisFolderTo',
      args: ['dest'],
      print: (action)=>`Move this folder to ${action.args.dest}`,
      snippet: 'moveThisFileTo(\'../newName\')'
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
  const actions = guiNoMore.findActions(sourceFile.getText())
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
  info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${(now() - t0) / 1000000}`)
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
    const simpleProject = createSimpleASTProject(info.project)
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
      if (selectedAction.name === 'moveThisFileTo') {
        simpleProject.getSourceFileOrThrow(sourceFileName).moveImmediatelySync(dest)
      }
      else if (selectedAction.name === 'moveThisFolderTo') {
        simpleProject.getDirectoryOrThrow(sourceFileName).moveImmediatelySync(dest)
      }
      simpleProject.saveSync()
    }
  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error  ${selectedAction.name} ${error + ' - ' + error.stack}`)
    return refactors
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor ${selectedAction.name} took  ${(now() - t0) / 1000000}`)
}

function getCompletionsAtPosition (fileName:string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
  prior.entries = prior.entries.concat(guiNoMore.getCompletionsAtPosition(fileName,position, options))
  return prior;
};


/** dirty way of getting path to config file of given program. TODO: better find current project tsconfig file */
function getConfigFilePath(project: ts_module.server.Project) {
  return project.getFileNames().find(p => basename(p.toString()) === 'tsconfig.json')
}
/** dirty way of creating a ts-simple-ast Project from an exiting ts.server.Project */
function createSimpleASTProject(project: ts_module.server.Project): Project {
  return new Project({
    tsConfigFilePath: getConfigFilePath(info.project)
  });
}



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
