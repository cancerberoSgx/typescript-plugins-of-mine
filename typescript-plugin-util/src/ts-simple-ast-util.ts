
import * as ts_module from 'typescript/lib/tsserverlibrary';
import Project, { PropertySignature, TypeGuards, createWrappedNode, ClassDeclaration } from 'ts-simple-ast'
import { basename } from 'path';

/** gets the config file of given ts project or undefined if given is not a ConfiguredProject */
function getConfigFilePath(project: ts_module.server.Project): string | undefined {
  if ((project as ts_module.server.ConfiguredProject).getConfigFilePath) {
    return (project as ts_module.server.ConfiguredProject).getConfigFilePath()
  }
  else { // workaround - probably this projecy is not configured
    return project.getFileNames().find(p => basename(p.toString()) === 'tsconfig.json')
  }
  // TODO: for integrate it in simple-ast try with findConfigFile
}


/**
 * (dirty way) of creating a ts-simple-ast Project from an exiting ts.server.Project. Given project must be a
 * configured project (created with a tsconfig file. It will recreates the project from scratch so it can take
 * some time. Use it with discretion
 */
export function createSimpleASTProject(nativeProject: ts_module.server.Project): Project {
  const tsConfigFilePath = getConfigFilePath(nativeProject)
  const project =  new Project({
    tsConfigFilePath: getConfigFilePath(nativeProject)
  })
  // simpleASTProjectCache[tsConfigFilePath] = {configFile: tsConfigFilePath, sourceFileMDates: {}}
  return project
}
// export interface SimpleASTProjectCacheValue {
//   configFile: string, 
//   sourceFileMDates: {[sourceFilePath:string]: number}
// }

// const simpleASTProjectCache: {[tsConfigFilePath:string]: {configFile: string, sourceFileMDates: {[sourceFilePath: string]: number} }} = {}

// function takeMtimeSimpleASTProject(project: Project){
// // project.getCompilerOptions().project.co
// }
// // export function refreshSimpleASTProject


// export function  refreshSimpleASTProject(project: Project, nativeProject: ts_module.server.Project){
//   //TODO: check new sourcefile dates (or content hash ? ) and for those sourcefiles which changed refresh!  also  ḧow to solve the problem of new files - deleted files ? 
// }
// //TODO: 