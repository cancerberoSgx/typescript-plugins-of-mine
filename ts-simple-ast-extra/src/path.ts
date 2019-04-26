import { getRelativePath as relative, pathJoin } from 'misc-utils-of-mine-generic'
import { Project } from 'ts-morph'

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
