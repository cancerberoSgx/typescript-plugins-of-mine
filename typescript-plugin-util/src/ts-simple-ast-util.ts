import { basename } from 'path'
import Project, { Node } from 'ts-simple-ast'
import * as ts_module from 'typescript/lib/tsserverlibrary'

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
export function createSimpleASTProject(nativeProjectOrPath: ts_module.server.Project | string): Project {
  const tsConfigFilePath = typeof nativeProjectOrPath === 'string' ? nativeProjectOrPath : getConfigFilePath(nativeProjectOrPath)
  const project = new Project({
    tsConfigFilePath
  })
  return project
}
/**
 * like getChildren but using forEachChild(). TODO: perhaps is a good idea to add a useForEachChild to ts-simple-ast getChildren that is optional but if provided do this ? 
 */
export function getChildrenForEachChild(n: Node): Node[] {
  const result: Node[] = []
  n.forEachChild(n => result.push(n))
  return result
}
/**
 *  try to call n.getName or returns empty string if there is no such method
 * @param n
 */
export function getName(n: Node): string {
  return (n as any).getName ? ((n as any).getName() + '') : ''
} 



// encapsulate simple project creation here so we can start testing caching the project and refreshing it instead of fully create it


export function getSimpleProject(project: ts_module.server.Project) : Project {
  // TODO: try to cache and do unit test simulating TLS
  // if(!simpleProject){
    let tsConfigPath: string = getConfigFilePath(project)
    let simpleProject: Project = createSimpleASTProject(tsConfigPath)
  // }
  return simpleProject
}

