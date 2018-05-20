// import { LanguageServiceOptionals, getPluginCreate } from 'typescript-plugin-util';
// import { findChildContainingRange, positionOrRangeToRange, isDeclaration, hasDeclaredType, positionOrRangeToNumber, getKindName } from 'typescript-ast-util';
// import * as ts_module from 'typescript/lib/tsserverlibrary';
// import { now } from 'hrtime-now'



// const PLUGIN_NAME = 'typescript-plugin-gui-no-more'
// const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

// let ts: typeof ts_module
// let info: ts_module.server.PluginCreateInfo

// const pluginDefinition: LanguageServiceOptionals = {
//   getApplicableRefactors
// }

// export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
//   ts = modules.typescript
//   info = anInfo
//   info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
// })


// function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
//   : ts.ApplicableRefactorInfo[] {

//   const t0 = now()
//   const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
//   const program = info.languageService.getProgram()
//   const sourceFile = program.getSourceFile(fileName)

//   if (!sourceFile) {
//     return refactors
//   }

//   const config = {
//     prefix: '&%&%', // TODO: from info.config
//     allActionsEvalPrefix: `
// function moveThisFileTo(path){return {action: 'moveThisFileTo', args: {dest: path} }};
// function moveThisFolderTo(path){return {action: 'moveThisFolderTo', args: {dest: path} }};
//   `
//   }

//   const actions: Action[] = findActions(sourceFile, config)

//   if (!actions || actions.length === 0) {
//     return refactors
//   }

//   refactors.push({
//     name: `${PLUGIN_NAME}-refactor-info`,
//     description: 'gui-no-more-action',
//     actions: actions.map(action => ({ name: REFACTOR_ACTION_NAME + '-' + action.action, description: printAction(action) }))
//   })

//   info.project.projectService.logger.info(`${PLUGIN_NAME} getApplicableRefactors took ${(now() - t0) / 1000000}`)
//   return refactors
// }


// function findActions(sourceFile: ts_module.SourceFile, config: Config): Action[] {
//   const actions: Action[] = []
//   const fileStr = sourceFile.getText()
//   const lines = fileStr.split('\n') //TODO: use new line format in tsconfig
//   lines.forEach(line => {
//     const i = line.indexOf(config.prefix)
//     if (i === -1) {
//       return
//     }
//     const userCall = line.substr(i + config.prefix.length, line.length)
//     try {
//       const result = eval(config.allActionsEvalPrefix + ';' + userCall)
//       if (result && typeof result === 'object') {
//         actions.push(result)
//       }
//     } catch (ex) {
//     }
//   })
//   return actions
// }

// function printAction(action: Action): string {
//   if(action.action==='moveThisFileTo'){
//     return 'Move this file to '+action.args.dest
//   }
//   else {
//     return 'Move this folder to '+action.args.dest
//   }
// }


// interface Config {
//   prefix: string,
//   allActionsEvalPrefix: string
// }
// interface Action {
//   action: string
//   args: { [key: string]: string }
// }
