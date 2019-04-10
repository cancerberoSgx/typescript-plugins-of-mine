import { Directory, Project, SourceFile, TypeGuards } from 'ts-morph'
import { pathJoin, getRelativePath as relative } from 'misc-utils-of-mine-generic'
import { File } from './fileNode'

export function buildProject(options: { tsConfigFilePath: string }) {
  const project = new Project({
    tsConfigFilePath: options.tsConfigFilePath,
    addFilesFromTsConfig: true
  })
  return project
}

export function checkFilesInProject(files: (File)[], project: Project) {
  files.forEach(file => {
    if (isSourceFile(file) && !project.getSourceFile(file.getFilePath())) {
      throw `File ${file.getFilePath()} not found in project`
    } else if (!isSourceFile(file) && !project.getDirectory(file.getPath())) {
      throw `Directory ${file.getPath()} not found in project`
    }
  })
}

export function isSourceFile(f: any): f is SourceFile {
  return f && f.organizeImports
}

export function isDirectory(f: any): f is Directory {
  return f && f.getDescendantSourceFiles && f.getDescendantDirectories
}

export function getBasePath(project: Project) {
  const rootDir = project.getRootDirectories()[0]
  return rootDir.getPath()
}

export function getAbsolutePath(relativePath: string, project: Project) {
  return pathJoin(getBasePath(project), relativePath).replace(/\\/g, '/')
}
export function getRelativePath(path: string, project: Project) {
  return relative(getBasePath(project), getAbsolutePath(path, project))
}

export function getFileFromRelativePath(path: string, project: Project) {
  const rootDir = project.getRootDirectories()[0]
  path = path.startsWith('./') ? path.substring(2) : path
  return rootDir.getDirectory(path) || rootDir.getSourceFile(path)
}
