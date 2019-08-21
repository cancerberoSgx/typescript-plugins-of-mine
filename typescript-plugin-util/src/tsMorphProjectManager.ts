
import { basename } from 'path';
import { Project } from 'ts-morph';
import * as ts_module from 'typescript/lib/tsserverlibrary';

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
 * public only for compatibility . Obsolete! will me removed
 * (dirty way) of creating a ts-simple-ast Project from an exiting ts.server.Project. Given project must be a
 * configured project (created with a tsconfig file. It will recreates the project from scratch so it can take
 * some time. Use it with discretion
 */
export function createSimpleASTProject(nativeProject: ts_module.server.Project): Project {
  const tsConfigFilePath = getConfigFilePath(nativeProject)
  const { project } = getProjectManager().getProjectFor(tsConfigFilePath)
  return project
}

// TODO: from plugin settings
export const REUSE_TS_MORPH_PROJECT = true

let _pm: ProjectManager
export function getProjectManager() {
  if (!_pm) {
    _pm = new ProjectManagerImpl(REUSE_TS_MORPH_PROJECT)
  }
  return _pm
}

class ProjectManagerImpl implements ProjectManager {
  public tsConfigFilePath: string
  public project: Project
  private projectPool: PluginProject[] = []
  public getProjectFor(tsConfigFilePath: string) {
    if (REUSE_TS_MORPH_PROJECT) {
      let project: PluginProject = this.projectPool.find(p => p.tsConfigFilePath === tsConfigFilePath)
      if (!project) {
        project = {
          tsConfigFilePath,
          project: new Project({
            tsConfigFilePath
          })
        }
        this.projectPool.push(project)
      }
      return project
    } else {
      return {
        tsConfigFilePath,
        project: new Project({
          tsConfigFilePath
        })
      }
    }
  }
  constructor(protected reuseProject: boolean) { }
  public ensureUpdated() {
    // TODO: do this better. see how to improve addSourceFilesFromTsConfig - manage snapshot / versions or time modifications. only add th enew files, only update dirty.
    this.project.addSourceFilesFromTsConfig(this.tsConfigFilePath)
    this.project.getSourceFiles().filter(f => !f.isInNodeModules() && !f.isFromExternalLibrary() && !f.isDeclarationFile()).forEach(f => f.refreshFromFileSystemSync())
  }
}
export interface ProjectManager {
  ensureUpdated(): void
  getProjectFor(tsConfigFilePath: string): PluginProject
}
export interface PluginProject {
  tsConfigFilePath: string
  project: Project
}

