import { basename } from 'path'
import Project, { Node, Options, IndentationText, QuoteKind, ManipulationSettings, NewLineKind } from 'ts-simple-ast'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import { writeFileSync } from 'fs';

/** gets the config file of given ts project or undefined if given is not a ConfiguredProject or tsconfig
 * cannot be found */
export function getConfigFilePath(project: ts_module.server.Project): string | undefined {
  if ((project as ts_module.server.ConfiguredProject).getConfigFilePath) {
    return (project as ts_module.server.ConfiguredProject).getConfigFilePath()
  }
  else {
    // workaround - probably this project is not configured
    return project.getFileNames().find(p => basename(p.toString()) === 'tsconfig.json')
  }
  // TODO: for integrate it in simple-ast try with findConfigFile
}

const a = 1

/**
 * (dirty way) of creating a ts-simple-ast Project from an exiting ts.server.Project. Given project must be a
 * configured project (created with a tsconfig file. It will recreates the project from scratch so it can take
 * some time. Use it with discretion
 */
export function createSimpleASTProject(nativeProjectOrPath: ts_module.server.Project | string, formatOptions?: ts.FormatCodeSettings, userPreferences?: ts_module.UserPreferences): Project {
  const tsConfigFilePath = typeof nativeProjectOrPath === 'string' ? nativeProjectOrPath : getConfigFilePath(nativeProjectOrPath)
  const projectConfig: Options = {
    tsConfigFilePath,
    manipulationSettings: buildManipulationSettings(formatOptions, userPreferences)
  }
  const project = new Project(projectConfig)
  return project
}


export function buildManipulationSettings(formatOptions?: ts.FormatCodeSettings, userPreferences?: ts_module.UserPreferences): ManipulationSettings {
  let indentationText: IndentationText = IndentationText.TwoSpaces
  if (formatOptions) {
    if (!formatOptions.convertTabsToSpaces) {
      indentationText = IndentationText.Tab
    }
    else if (formatOptions.tabSize === 4) {
      indentationText = IndentationText.FourSpaces
    }
    else if (formatOptions.tabSize === 8) {
      indentationText = IndentationText.EightSpaces
    }
  }
  const obj: ManipulationSettings = {
    indentationText,
    newLineKind: !formatOptions ? NewLineKind.LineFeed : formatOptions.newLineCharacter === '\n' ? NewLineKind.LineFeed : NewLineKind.CarriageReturnLineFeed,
    quoteKind: (userPreferences && userPreferences.quotePreference === 'double') ? QuoteKind.Double : QuoteKind.Single,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: formatOptions && formatOptions.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces
  }
  return obj
}


// TODO: encapsulate simple project creation here so we can start testing caching the project and refreshing
// it instead of fully create it
export function getSimpleProject(project: ts_module.server.Project, formatOptions?: ts.FormatCodeSettings, userPreferences?: ts_module.UserPreferences): Project {

  // TODO: try to cache and do unit test simulating TLS if(!simpleProject){
  let tsConfigPath: string = getConfigFilePath(project)
  let simpleProject: Project = createSimpleASTProject(tsConfigPath, formatOptions, userPreferences)
  // }
  return simpleProject
}

