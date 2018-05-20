import { now } from 'hrtime-now';
import { basename, dirname, isAbsolute, join } from 'path';
import Project from 'ts-simple-ast';
import { LanguageServiceOptionals, getPluginCreate } from 'typescript-plugin-util';
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { moveDeclarationNamed } from './moveDeclaration';

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
  actionName: string): ts.RefactorEditInfo | undefined {
  const t0 = now()
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (actionName !== REFACTOR_ACTION_NAME) {
    return refactors
  }
  try {
    // TODO: could we maintain a simple-ast Project in a variable and next time just refresh it so is faster ?
    // perhaps with this: simpleProject.getSourceFiles().forEach(f=>f.refreshFromFileSystemSync())
    const simpleProject = createSimpleASTProject(info.project)
    const sourceFile = simpleProject.getSourceFileOrThrow(fileName)
    let dest: string = isAbsolute(selectedAction.args.dest) ? selectedAction.args.dest :
      join(dirname(fileName), selectedAction.args.dest)
    const targetFile = simpleProject.getSourceFile(dest)
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor moveDeclarationNamed ${selectedAction.args.declarationName}, ${sourceFile.getFilePath()}, ${targetFile.getFilePath()}`)
    moveDeclarationNamed(selectedAction.args.declarationName, sourceFile, simpleProject, targetFile)
    // sourceFile.compilerNode.
    info.languageService.getEmitOutput(sourceFile.getFilePath())
    info.languageService.getEmitOutput(targetFile.getFilePath())
    simpleProject.saveSync()

  } catch (error) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor error  ${selectedAction.name} ${error + ' - ' + error.stack}`)
    return refactors
  }
  info.project.projectService.logger.info(`${PLUGIN_NAME} getEditsForRefactor ${selectedAction.name} took  ${(now() - t0) / 1000000}`)
}

function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
  prior.entries = prior.entries.concat(interactionTool.getCompletionsAtPosition(fileName, position, options))
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
