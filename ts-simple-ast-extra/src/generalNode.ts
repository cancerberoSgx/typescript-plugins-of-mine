import { Directory, Node } from 'ts-morph'
import { getChildrenForEachChild, buildAstPath } from '.'
import { printAstPath } from './astPath'
import { isDirectory, isSourceFile } from './node'
import { getFilePath } from './fileNode'
import { getRelativePath } from 'misc-utils-of-mine-generic'

/**
 * General definition of nodes that contemplate everything, directories, sourceFiles, and nodes, with a common minimal API
 */
export type GeneralNode = Node | Directory

/**
 * Returns immediate children. In case of Nodes, children are obtained using forEachChild instead of getChildren method
 */
export function getGeneralNodeChildren(f: GeneralNode): GeneralNode[] {
  return isDirectory(f)
    ? (f.getDirectories() as GeneralNode[]).concat(f.getSourceFiles() as GeneralNode[])
    : getChildrenForEachChild(f)
}

/**
 * get general node's parent
 */
export function getGeneralNodeParent(f: GeneralNode): GeneralNode | undefined {
  return isDirectory(f) ? (f.getParent() as GeneralNode) : isSourceFile(f) ? f.getDirectory() : f.getParent()
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
