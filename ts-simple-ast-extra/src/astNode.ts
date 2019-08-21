// import { asArray } from 'misc-utils-of-mine-generic'
// import {
//   GeneralNode,
//   getName,
//   getNodeProperty as getNodeProperty_,
//   isDirectory,
//   isNode,
//   isSourceFile,
//   setNodeProperty as setNodeProperty_,
//   tsMorph
// } from 'ts-simple-ast-extra'
// import { getConfig } from '../query/config'
// import { getASTRoot } from '../query/file'

// /**
//  * General definition of nodes that contemplate everything, directories, sourceFiles, and nodes, with a common minimal API
//  */
// export type ASTNode = GeneralNode

// /**
//  * Returns immediate children. In case of Nodes, children are obtained using forEachChild or getChildren according to
//  * given getChildren parameter or to global config
//  */
// export function getASTNodeChildren(f: ASTNode, getChildren: boolean = getConfig('getChildren')): ASTNode[] {
//   return !f
//     ? []
//     : isDirectory(f)
//     ? (f.getDirectories() as ASTNode[])
//         .concat(f.getSourceFiles())
//         .filter(f => getConfig('includeFilesInNodeModules') || !getASTNodeFilePath(f).includes('node_modules'))
//     : f
//     ? getChildren
//       ? f.getChildren()
//       : f.forEachChildAsArray()
//     : []
// }

// export function getASTNodeParent(f: ASTNode): ASTNode | undefined {
//   return !f
//     ? undefined
//     : isDirectory(f)
//     ? f.getParent() && f.getParent()!.isDescendantOf(getASTRoot().getRootDirectory() as tsMorph.Directory)
//       ? (f.getParent() as ASTNode)
//       : undefined
//     : isSourceFile(f)
//     ? f.getDirectory()
//     : f.getParent()
// }

// /**
//  * ASTNodeType are not ASTNodes, they are not part of the AST. They can only be accessed using the function 'get':
//  *
//  *
//  */
// export interface ASTNodeType {}

// export function getASTNodeSiblings(n: ASTNode) {
//   if (isSourceFile(n)) {
//     const p = n.getDirectory()
//     if (p && p !== (n as any)) {
//       return p.getSourceFiles().filter(f => f !== n)
//     }
//   } else if (isDirectory(n)) {
//     const p = n.getParent()
//     if (p && p !== (n as any)) {
//       return p.getDirectories().filter(f => f !== n)
//     }
//   } else {
//     return [...n.getNextSiblings(), ...n.getPreviousSiblings()]
//   }
//   return []
// }

// export function getASTNodeAncestors(n: ASTNode) {
//   const propName = 'ancestors'
//   if (getConfig('cacheAncestors')) {
//     const cached = getNodeProperty(n, propName)
//     if (typeof cached !== 'undefined') {
//       return cached
//     }
//   }
//   const value: ASTNode[] = []
//   let b: ASTNode | undefined = n
//   while ((b = getASTNodeParent(b)) && b !== n) {
//     value.push(b)
//   }
//   if (getConfig('cacheAncestors')) {
//     setNodeProperty(n, propName, value)
//   }
//   return value
// }

// /**
//  * Gets a ASTNode that represents the SourceFile of given node, or undefined if it doesn't apply (i.e, given node is a directory).
//  */
// export function getASTSourceFile(f: ASTNode): ASTNode | undefined {
//   return !f ? undefined : isDirectory(f) ? undefined : isSourceFile(f) ? f : f.getSourceFile()
// }

// export function isASTNode(f: any): f is ASTNode {
//   return f && (isNode(f) || isDirectory(f))
// }

// export function getASTNodeKindName(n: ASTNode) {
//   return !n ? '' : isNode(n) ? n.getKindName() : 'Directory'
// }

// export function getASTNodeName(node: ASTNode) {
//   if (isDirectory(node) || isSourceFile(node)) {
//     return node.getBaseName() || ''
//   } else {
//     return getName(node) || ''
//   }
// }

// export function setNodeProperty(n: ASTNode, path: string | (string | number)[], value: any) {
//   setNodeProperty_(n as any, ['cannabis', ...asArray(path)], value)
// }

// export function getNodeProperty<T = any>(n: ASTNode, path: string | (string | number)[]): T | undefined {
//   return getNodeProperty_(n as any, ['cannabis', ...asArray(path)])
// }

// export function getASTNodeText(n: ASTNode) {
//   return !n ? '' : isDirectory(n) ? n.getPath() : isNode(n) ? n.getText() : ''
// }

// export function getASTNodeFilePath(n: ASTNode) {
//   return isDirectory(n) ? n.getPath() : n ? n.getSourceFile().getFilePath() : ''
// }

// export function visit<T extends ASTNode = any>(
//   n: T,
//   v: (n: T, parent?: T | undefined, level?: number | undefined) => boolean,
//   childrenFirst = getConfig('visitChildrenFirst'),
//   parent?: T,
//   level = 0
// ) {
//   if (!n) {
//     return
//   }
//   if (!childrenFirst && v(n, parent, level)) {
//     return true
//   }
//   getASTNodeChildren(n).forEach((c: any) => {
//     visit(c, v, childrenFirst, n, level + 1)
//   })
//   return childrenFirst && v(n, parent, level)
// }

// export function getASTNodeDescendants(node: ASTNode) {
//   const a: ASTNode[] = []
//   visit(node, n => {
//     a.push(n)
//     return false
//   })
//   return a
// }
