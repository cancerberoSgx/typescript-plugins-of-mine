import { basename } from 'path';
import Project from 'ts-simple-ast';
import * as ts_module from 'typescript/lib/tsserverlibrary';

/** gets the config file of given ts project or undefined if given is not a ConfiguredProject or tsconfig cannot be found */
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
/**
 * (dirty way) of creating a ts-simple-ast Project from an exiting ts.server.Project. Given project must be a
 * configured project (created with a tsconfig file. It will recreates the project from scratch so it can take
 * some time. Use it with discretion
 */
export function createSimpleASTProject(nativeProjectOrPath: ts_module.server.Project|string): Project {
  const tsConfigFilePath = typeof nativeProjectOrPath === 'string' ? nativeProjectOrPath : getConfigFilePath(nativeProjectOrPath)
  const project = new Project({
    tsConfigFilePath
  })
  return project
}
