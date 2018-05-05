import * as ts_module from '../node_modules/typescript/lib/tsserverlibrary';
// import { ADDRCONFIG } from 'dns';
// import * as ts from 'typescript'

function init(modules: { typescript: typeof ts_module }) {
  const ts = modules.typescript;

  function create(info: ts_module.server.PluginCreateInfo) {
    // Get a list of things to remove from the completion list from the config object.
    // If nothing was specified, we'll just remove 'caller'
    const whatToRemove: string[] = info.config.remove || ['caller'];

    // Diagnostic logging
    info.project.projectService.logger.info('I\'m getting set up now! Check the log for this message.');

    // Set up decorator
    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k];
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    // Remove specified entries from completion list
    proxy.getCompletionsAtPosition = (fileName, position) => {
      const prior = info.languageService.getCompletionsAtPosition(fileName, position, undefined);
      const oldLength = prior.entries.length;
      prior.entries = prior.entries.filter(e => whatToRemove.indexOf(e.name) < 0);

      // Sample logging for diagnostic purposes
      if (oldLength !== prior.entries.length) {
        info.project.projectService.logger.info(`Removed ${oldLength - prior.entries.length} entries from the completion list`);
      }

      return prior;
    };



    proxy.getApplicableRefactors = (fileName, positionOrRaneg) => {
      // info.project.projectService.logger.info(`seba refactors start`);
      const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
      if (!sourceFile) {
        throw Error('seba no source file')
      }
      // sourceFile.getn
      const refactorInfo: ts_module.ApplicableRefactorInfo = {
        name: 'sebarefactoractionname',
        description: 'seba refactor inf odesc',
        actions: [{ name: REFACTOR_ACTION_NAME, description: 'sebarefactiondesc' }],
      }
      const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRaneg) || []
      refactors.push(refactorInfo)
      // info.project.projectService.logger.info(`seba refactors end`);
      return refactors
    }
    
    //https://github.com/kingdaro/typescript-test-plugin/blob/master/src/index.ts
    proxy.getEditsForRefactor = (fileName, formatOptions, positionOrRange, refactorName, actionName) => {
      if (actionName !== REFACTOR_ACTION_NAME) {
        return info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
      }

      const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
      if (!sourceFile) {
        throw Error('seba no source file')
      }
      const range = resolvePositionOrRange(positionOrRange)
      // ts.tok
      const text = sourceFile.text.slice(range.pos, range.end)

      const editStart = range.pos + text.indexOf("a + b")

      const editSpan: ts_module.TextSpan = { start: editStart, length: "a + b".length }

      return {
        edits: [
          {
            fileName,
            textChanges: [{ span: editSpan, newText: "b + a" }],
          },
        ],
        renameFilename: undefined,
        renameLocation: undefined,
      }
    }

    return proxy;
  }

  return { create };
}

const REFACTOR_ACTION_NAME = 'sebarefactioninfo';
// class SampleRefactorInfo implements ts.ApplicableRefactorInfo {
//   name: string = 'sebaapprefactorinfo ';
//   description: string = 'sebadescsebaapprefactorinfo';
//   inlineable?: boolean | undefined = true;
//   actions: ts.RefactorActionInfo[] = [new SampleRefactorActionInfo()];
// }

// class SampleRefactorActionInfo implements ts.RefactorActionInfo {
//   name: string = REFACTOR_ACTION_NAME;
//   description: string = 'sebadescrefactioninfo';
// }

function resolvePositionOrRange(positionOrRange: number | ts_module.TextRange) {
  return typeof positionOrRange === "number"
    ? { pos: positionOrRange, end: positionOrRange }
    : positionOrRange
}


export = init;