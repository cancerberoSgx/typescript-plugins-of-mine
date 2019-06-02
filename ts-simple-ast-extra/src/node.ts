import { Node, TypeGuards, SourceFile, Directory, ts } from 'ts-morph'
import { setObjectProperty, getObjectProperty } from 'misc-utils-of-mine-generic'

/**
 * like Node.getChildren but using forEachChild(). TODO: perhaps is a good idea to add a useForEachChild to
 * ts-simple-ast getChildren that is optional but if provided do this ?
 */
export function getChildrenForEachChild(n: Node): Node[] {
  return n.forEachChildAsArray()
}

/**
 * Similar to  getChildren() but, if one of child is SyntaxList, it will return the syntax list getChildren()
 * instead of it. This is to be coherent with getParent() where rotNode.getParent()===SourceFile but
 * rootNode.getParent().getChildren() will be [SyntaxList, EndOfFileToken]
 */
export function getChildrenByPassSyntaxList(n: Node): Node[] {
  return n
    .getChildren()
    .map(c => (TypeGuards.isSyntaxList(c) ? c.getChildren() : [c]))
    .flat()
}

/**
 *  Gets given node's name if any. First try to guess TypeGuards.hasName(n) ? n.getName() and if is not
 *  supported try to read a children of type identifier. If none found returns undefined.
 */
export function getName(n: Node) {
  if (TypeGuards.isSourceFile(n)) {
    return n.getBaseNameWithoutExtension()
  }
  function getNodeName(n: Node) {
    if (TypeGuards.isIdentifier(n)) {
      return n.getText()
    }
    const id = n.getFirstChildByKind(ts.SyntaxKind.Identifier)
    return id ? id.getText() : undefined
  }
  try {
    return (TypeGuards.hasName(n) ? n.getName() : getNodeName(n)) || undefined
  } catch (error) {
    return undefined
  }
}

export function setNodeProperty(n: Node, path: string | (string | number)[], value: any) {
  if (!(n as any).cannabis_meta) {
    ;(n as any).cannabis_meta = {}
  }
  setObjectProperty((n as any).cannabis_meta, path, value)
}

export function getNodeProperty<T = any>(n: Node, path: string | (string | number)[]): T | undefined {
  if (!(n as any).cannabis_meta) {
    ;(n as any).cannabis_meta = {}
  }
  return getObjectProperty<T>((n as any).cannabis_meta, path)
}

/**
 * Iterates recursively over all children of given node and apply visitor on each of them. If visitor returns
 * non falsy value then it stops visiting and that value is returned to the caller. See
 * https://en.wikipedia.org/wiki/Tree_traversal for the meaning of "DeepFirst".
 *
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`
 */
export function visitChildrenRecursiveDeepFirst(
  node: Node,
  visitor: (node: Node, index?: number, level?: number) => Node | undefined | void,
  index: number = 0,
  level: number = 0,
  stopOnTruthy: boolean = false,
  getChildrenMode: boolean = false
): Node | undefined {
  if (!node) {
    return
  }
  const result = visitor(node, index, level)
  if (stopOnTruthy && result) {
    return result
  }
  let i = 0
  if (!getChildrenMode) {
    node.forEachChild(child =>
      visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1, stopOnTruthy, getChildrenMode)
    )
  } else {
    node
      .getChildren()
      .forEach(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1, stopOnTruthy, getChildrenMode))
  }
}

export function isNode(n: any): n is Node {
  return n && typeof n.getText === 'function' && typeof n.getKindName === 'function'
}

export function isSourceFile(f: any): f is SourceFile {
  return f && f.organizeImports
}

export function isDirectory(f: any): f is Directory {
  return f && f.getDescendantSourceFiles && f.getDescendantDirectories
}

/**
 * Gets the "first of the first" descendant
 */
export function getFirstDescendant(node: Node): Node {
  return !node.getFirstChild() ? node : getFirstDescendant(node.getFirstChild()!)
}

export function getLastToken(d: Node) {
  try {
    return d.getLastToken()
  } catch (error) {}
}
