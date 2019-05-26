import { Directory, Node } from 'ts-morph'
import { getChildrenForEachChild, buildAstPath } from '.'
import { printAstPath } from './astPath'
import { isDirectory, isSourceFile, isNode } from './node'
import { getRelativePath } from 'misc-utils-of-mine-generic'

/**
 * General definition of nodes that contemplate everything, directories, sourceFiles, and nodes, with a common minimal API
 */
export type GeneralNode = Node | Directory

/**
 * Returns immediate children. In case of Nodes, children are obtained using forEachChild instead of getChildren method
 */
export function getGeneralNodeChildren(f: GeneralNode): GeneralNode[] {
  return !f
    ? []
    : isDirectory(f)
    ? (f.getDirectories() as GeneralNode[]).concat(f.getSourceFiles() as GeneralNode[])
    : getChildrenForEachChild(f)
}

export function isGeneralNode(f: any): f is GeneralNode {
  return f && (isNode(f) || isDirectory(f))
}

export function getGeneralNodeKindName(n: GeneralNode) {
  return !n ? undefined : isNode(n) ? n.getKindName() : 'Directory'
}

/**
 * get general node's parent
 */
export function getGeneralNodeParent(f: GeneralNode): GeneralNode | undefined {
  return !f
    ? undefined
    : isDirectory(f)
    ? (f.getParent() as GeneralNode)
    : isSourceFile(f)
    ? f.getDirectory()
    : f.getParent()
}

/**
 * Directories and SourceFile path is given by getPath* methods. For nodes we use AstPath for defining their path.
 */
export function getGeneralNodePath(f: GeneralNode, relativeTo?: string): string | undefined {
  if (isDirectory(f) || isSourceFile(f)) {
    return relativeTo ? getRelativePath(relativeTo, getFilePath(f)) : getFilePath(f)
  } else {
    const file = f.getSourceFile()
    const s = buildAstPath(f, file, { includeNodeKind: true })
    let nodePath = printAstPath(s)
    nodePath = nodePath.startsWith('SourceFile>') ? nodePath.substring('SourceFile>'.length) : nodePath
    const path = `${getGeneralNodePath(file, relativeTo)}#${nodePath}`
    return path
  }
}

import { Project, SourceFile } from 'ts-morph'

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
