import { Directory, Project, SourceFile } from 'ts-morph'
import { isSourceFile } from './node'

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

export function checkFilesInProject(files: (File)[], project: Project) {
  files.forEach(file => {
    if (isSourceFile(file) && !project.getSourceFile(file.getFilePath())) {
      throw `File ${file.getFilePath()} not found in project`
    } else if (!isSourceFile(file) && !project.getDirectory(file.getPath())) {
      throw `Directory ${file.getPath()} not found in project`
    }
  })
}
