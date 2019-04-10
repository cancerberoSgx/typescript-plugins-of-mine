// warning: this won't work on the client side - it's for typescript compiler plugin API - node.js only . TODO: remove to another package so this works 100% on the client side

import {ts, Project, ProjectOptions } from 'ts-morph'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import { buildManipulationSettings } from './compilerOptions'
import { basename } from 'misc-utils-of-mine-generic';

/** 
 * Gets the config file of given ts project or undefined if given is not a ConfiguredProject or tsconfig
 * cannot be found 
 */
export function getConfigFilePath(project: ts_module.server.Project): string | undefined {
  if ((project as ts_module.server.ConfiguredProject).getConfigFilePath) {
    return (project as ts_module.server.ConfiguredProject).getConfigFilePath()
  } else {
    // workaround - probably this project is not configured
    return project.getFileNames().find(p => basename(p.toString()) === 'tsconfig.json')
  }
  // TODO: for integrate it in simple-ast try with findConfigFile
}

/**
 * (dirty way) of creating a ts-simple-ast Project from an exiting ts.server.Project. Given project must be a
 * configured project (created with a tsconfig file. It will recreates the project from scratch so it can take
 * some time. Use it with discretion
 */
export function createSimpleASTProject(
  nativeProjectOrPath: ts_module.server.Project | string,
  formatOptions?: ts.FormatCodeSettings,
  userPreferences?: ts_module.UserPreferences
): Project {
  const tsConfigFilePath =
    typeof nativeProjectOrPath === 'string' ? nativeProjectOrPath : getConfigFilePath(nativeProjectOrPath)
  const projectConfig: ProjectOptions = {
    tsConfigFilePath,
    manipulationSettings: buildManipulationSettings(formatOptions, userPreferences)
  }
  const project = new Project(projectConfig)
  return project
}

/**
 * creates a ts-morph Project from given internal ts_module.server Project instance
 * 
 * TODO: encapsulate simple project creation here so we can start testing caching the project and refreshing it 
 * instead of fully create it
 */
export function getSimpleProject(
  project: ts_module.server.Project,
  formatOptions: ts.FormatCodeSettings={},
  userPreferences: ts_module.UserPreferences={}
): Project {
  // TODO: try to cache and do unit test simulating TLS if(!simpleProject){
  let tsConfigPath: string = getConfigFilePath(project)!
  let simpleProject: Project = createSimpleASTProject(tsConfigPath, formatOptions, userPreferences)
  // }
  return simpleProject
}
