import * as ts from 'typescript';
import { flat } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { getAllSupportedCodeFixesTryEach } from './supportedCodeFixes';

const PLUGIN_NAME = 'typescript-plugin-all-fixes-and-refactors'
let info: ts_module.server.PluginCreateInfo

function init(modules: { typescript: typeof ts_module }) {

  function create(anInfo: ts_module.server.PluginCreateInfo) {
    info = anInfo
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)

    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x!.apply(info.languageService, args)
    }

    proxy.getApplicableRefactors = getApplicableRefactors
    proxy.getEditsForRefactor = getEditsForRefactor

    return proxy
  }
  return { create }
}

export = init

function log(msg) {
  info.project.projectService.logger.info(`${PLUGIN_NAME} ${msg}`)
}

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, preferences: ts.UserPreferences | undefined): ts.ApplicableRefactorInfo[] {
  const all = getAllSupportedCodeFixesTryEach(info.languageService, fileName, positionOrRange, {}, preferences)
  const thisRefactor = {
    name: PLUGIN_NAME,
    description: PLUGIN_NAME,
    actions:
      all.map(fix => {
        const line = fix.changes[0] && fix.changes[0].textChanges[0] && fix.changes[0].textChanges[0].span && ts.getLineAndCharacterOfPosition(info.languageService.getProgram().getSourceFile(fileName), fix.changes[0].textChanges[0].span.start).line
        return {
          name: fix.diagnostic.code + '',
          description: `${fix.description} (code:${fix.diagnostic.code}, line:${line} - ${fix.diagnostic.message})`,
        }
      })
  }
  return [thisRefactor]
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts.TextRange, refactorName: string, actionName: string, preferences: ts.UserPreferences | undefined): ts.RefactorEditInfo | undefined {
  if (refactorName === PLUGIN_NAME) {
    log('getEditsForRefactor ' + actionName)
  }
  const code = parseInt(actionName)
  if (!code) {
    return undefined
  }
  const range: ts.TextRange = typeof (positionOrRange) === 'number' ? { pos: positionOrRange, end: positionOrRange } : positionOrRange
  const codeFixes = info.languageService.getCodeFixesAtPosition(fileName, range.pos, range.end, [code], formatOptions, preferences)
  return {
    edits: flat(codeFixes.map(c => c.changes))
  }
}
