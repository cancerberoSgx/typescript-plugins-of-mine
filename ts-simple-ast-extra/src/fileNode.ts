import { Directory, Project, SourceFile } from 'ts-morph'
import { isSourceFile } from './project'

/**
 * A general File definition that includes SourceFiles and Directories with common minimal API
 */
export type File = SourceFile | Directory

export function getFileRelativePath(f: File, project: Project) {
  const rootDir = project.getRootDirectories()[0]
  return rootDir.getRelativePathTo(f as SourceFile)
}

export function getParent(f: File): File | undefined {
  return isSourceFile(f) ? f.getDirectory() : f.getParent()
}

export function getFilePath(f: File) {
  return isSourceFile(f) ? f.getFilePath() : f.getPath()
}
