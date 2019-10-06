import { getRelativePath } from 'misc-utils-of-mine-generic'
import { Directory, Node, SourceFile } from 'ts-morph'
import { buildAstPath } from '.'
import { printAstPath } from './astPath'
import { getName, isDirectory, isNode, isSourceFile } from './node'

/**
 * General definition of nodes that contemplate everything, directories, sourceFiles, and nodes, with a common
 * minimal API
 */
export type GeneralNode = Node | Directory

// // a hack to guess what's the top-level directory of this project - since getParentDirectory() will keep navigating to the FS root
// export function getGeneralNodeRootFor(f: GeneralNode): GeneralNode {
//   //TODO
//   var a = getGeneralNodeAncestors(f)
//   return a.length ? a[a.length - 1] : f
// }

/**
 * Returns immediate children. In case of Nodes, children are obtained using forEachChild or getChildren
 * according to
 * given getChildren parameter or to global config
 */
export function getGeneralNodeChildren(
  f: GeneralNode,
  getChildren = true,
  includeFilesInNodeModules = false
): GeneralNode[] {
  return !f
    ? []
    : isDirectory(f)
      ? (f.getDirectories() as GeneralNode[])
        .concat(f.getSourceFiles())
        .filter(f => includeFilesInNodeModules || !getGeneralNodePath(f).includes('node_modules'))
      : f
        ? getChildren
          ? f.getChildren()
          : f.forEachChildAsArray()
        : []
}

// export function getGeneralNodeParent(f: GeneralNode): GeneralNode | undefined {
//   var root = getGeneralNodeRootFor(f)
//   if (!f || (isDirectory(f) && isDirectory(root) && !root.isAncestorOf(f))) {
//     return undefined
//   }
//   return isDirectory(f)
//     ? f.getParent() && f.getParent()!.isDescendantOf(root as Directory)
//       ? (f.getParent() as GeneralNode)
//       : undefined
//     : isSourceFile(f)
//       ? f.getDirectory()
//       : f.getParent()
// }

// export function getGeneralNodeAncestors(n: GeneralNode) {
//   // const propName = 'ancestors'
//   // if (getConfig('cacheAncestors')) {
//   //   const cached = getNodeProperty(n, propName)
//   //   if (typeof cached !== 'undefined') {
//   //     return cached
//   //   }
//   // }
//   const value: GeneralNode[] = []
//   let b: GeneralNode | undefined = n
//   while ((b = getGeneralNodeParent(b)) && b !== n) {
//     value.push(b)
//   }
//   // if (getConfig('cacheAncestors')) {
//   //   setNodeProperty(n, propName, value)
//   // }
//   return value
// }

// /**
//  * Returns immediate children. In case of Nodes, children are obtained using forEachChild instead of getChildren method
//  */
// export function getGeneralNodeChildren(f: GeneralNode): GeneralNode[] {
//   return !f
//     ? []
//     : isDirectory(f)
//     ? (f.getDirectories() as GeneralNode[]).concat(f.getSourceFiles() as GeneralNode[])
//     : getChildrenForEachChild(f)
// }

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
 * Directories and SourceFile path is given by getPath* methods. For nodes we use AstPath for defining their
 * path.
 */
export function getGeneralNodePath(f: GeneralNode, relativeTo?: string): string {
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

/**
 * A general File definition that includes SourceFiles and Directories with common minimal API
 */
export type File = SourceFile | Directory

// export function getFileRelativePath(f: File, project: Project) {
//   const rootDir = project.getRootDirectories()[0]
//   return rootDir.getRelativePathTo(f as SourceFile)
// }

// export function geGeneralNodeParent(f: File): File | undefined {
//   return isSourceFile(f) ? f.getDirectory() : f.getParent()
// }

export function getFilePath(f: File) {
  return isSourceFile(f) ? f.getFilePath() : f.getPath()
}

// export function checkFilesInProject(files: (File)[], project: Project) {
//   files.forEach(file => {
//     if (isSourceFile(file) && !project.getSourceFile(file.getFilePath())) {
//       throw `File ${file.getFilePath()} not found in project`
//     } else if (!isSourceFile(file) && !project.getDirectory(file.getPath())) {
//       throw `Directory ${file.getPath()} not found in project`
//     }
//   })
// }

export function getGeneralNodeName(node: GeneralNode) {
  if (isDirectory(node) || isSourceFile(node)) {
    return node.getBaseName() || ''
  } else {
    return getName(node) || ''
  }
}

// export function setNodeProperty(n: GeneralNode, path: string | (string | number)[], value: any) {
//   setNodeProperty_(n as any, ['cannabis', ...asArray(path)], value)
// }

// export function getNodeProperty<T = any>(n: GeneralNode, path: string | (string | number)[]): T | undefined {
//   return getNodeProperty_(n as any, ['cannabis', ...asArray(path)])
// }

export function getGeneralNodeText(n: GeneralNode) {
  return !n ? '' : isDirectory(n) ? n.getPath() : isNode(n) ? n.getText() : ''
}

export function getGeneralNodeFilePath(n: GeneralNode) {
  return isDirectory(n) ? n.getPath() : n ? n.getSourceFile().getFilePath() : ''
}

export function visit<T extends GeneralNode = any>(
  n: T,
  v: (n: T, parent?: T | undefined, level?: number | undefined) => boolean,
  childrenFirst = true,
  parent?: T,
  level = 0
) {
  if (!n) {
    return
  }
  if (!childrenFirst && v(n, parent, level)) {
    return true
  }
  getGeneralNodeChildren(n).forEach((c: any) => {
    visit(c, v, childrenFirst, n, level + 1)
  })
  return childrenFirst && v(n, parent, level)
}

export function getGeneralNodeDescendants(node: GeneralNode, childrenFirst = true) {
  const a: GeneralNode[] = []
  visit(
    node,
    n => {
      a.push(n)
      return false
    },
    childrenFirst
  )
  return a
}

export function filterGeneralNodeDescendants(node: GeneralNode, p: (n: GeneralNode) => boolean, childrenFirst = true) {
  const a: GeneralNode[] = []
  visit(
    node,
    n => {
      p(n) && a.push(n)
      return false
    },
    childrenFirst
  )
  return a
}

export function findGeneralNodeDescendants(node: GeneralNode, p: (n: GeneralNode) => boolean, childrenFirst = true) {
  let a: GeneralNode | undefined
  visit(
    node,
    n => {
      a = n
      return p(n)
    },
    childrenFirst
  )
  return a
}
