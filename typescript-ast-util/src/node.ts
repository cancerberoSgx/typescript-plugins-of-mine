
import * as ts from 'typescript'

/**
 * Iterates recursively over all children of given node and apply visitor on each of them. If visitor returns
 * non falsy value then it stops visiting and that value is returned to the caller. See
 * https://en.wikipedia.org/wiki/Tree_traversal for the meaning of "DeepFirst". 
 *
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`.
 */
export function visitChildrenRecursiveDeepFirst(
  node: ts.Node,
  visitor: (node: ts.Node, index?: number, level?: number) => ts.Node | undefined | void,
  index: number = 0,
  level: number = 0,
  stopOnTruthy: boolean = false,
  getChildrenMode: boolean = false
): ts.Node | undefined {
  if (!node) {
    return
  }
  const result = visitor(node, index, level)
  if (stopOnTruthy && result) {
    return result
  }
  let i = 0
  if (!getChildrenMode) {
    return node.forEachChild(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1, stopOnTruthy, getChildrenMode))
  } else {
    node.getChildren().forEach(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1, stopOnTruthy, getChildrenMode))
  }
}

export function filterChildren(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = true,
  children: Array<ts.Node> = [])
  : Array<ts.Node> {

  if (!parent) {
    return []
  }
  if (!recursive) {
    ts.forEachChild(parent, child => {
      if (predicate(child)) {
        children.push(child)
      }
    })
  } else {
    visitChildrenRecursiveDeepFirst(parent, child => {
      if (predicate(child)) {
        children.push(child)
      }
    })
  }
  return children
}

export function findChild(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = true)
  : ts.Node | undefined {
  if (!parent) {
    return
  }
  let found: ts.Node | undefined
  if (recursive) {
    visitChildrenRecursiveDeepFirst(parent, child => {
      if (predicate(child)) {
        found = child
      }
    })
  }
  else {
    parent.forEachChild(child => {
      if (predicate(child)) {
        found = child
      }
    })
  }
  return found
}

/**
 * This iterates less child than findChild, we don't understand why yet... we need this because makes
 * plugin-subclasses-of work (for some reason).
 */
export function findChild2(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false)
  : ts.Node | undefined {
  if (!parent) {
    return
  }
  let found: ts.Node | undefined
  if (recursive) {
    visitChildrenRecursiveDeepFirst(parent, child => {
      if (predicate(child)) {
        found = child
      }
    })
  }
  else {
    found = parent.forEachChild(child => {
      return predicate(child) && child
    })
  }
  return found
}

/**
 * Return immediate children of given node. 
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`.
 */
export function getChildren(node: ts.Node | undefined, getChildrenMode: boolean = false): ts.Node[] {
  if (!node) {
    return []
  }
  if (getChildrenMode) {
    return node.getChildren()
  }
  const result: ts.Node[] = []
  node.forEachChild(c => {
    result.push(c)
  })
  return result
}

/**
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`.
 * @param children if caller already have called getChildren he can pass it here so this call is faster.
 */
export function getChildIndex(node: ts.Node, getChildrenMode: boolean = false, children: ts.Node[] | undefined = undefined): number {
  let result = -1
  node.parent && (children || getChildren(node.parent, getChildrenMode)).find((c, i) => {
    if (c === node) {
      result = i
      return true
    }
  })
  return result
}

/**
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`.
 */
export function getNextSibling(node: ts.Node, getChildrenMode: boolean = false): ts.Node | undefined {
  const children = getChildren(node.parent, getChildrenMode)
  const index = getChildIndex(node, getChildrenMode, children)
  return node.parent && index < children.length - 1 ? children[index + 1] : undefined
}

/**
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`
 */
export function getSiblings(node: ts.Node, getChildrenMode: boolean = false): ts.Node[] {
 return getChildren(node.parent, getChildrenMode).filter(c=>c!==node)
}

/**
 * @param getChildrenMode if true it will use `node.getChildren()` o obtain children instead of default
 * behavior that is using `node.forEachChild`.
 */
export function getPreviousSibling(node: ts.Node, getChildrenMode: boolean = false): ts.Node | undefined {
  const children = getChildren(node.parent, getChildrenMode)
  const index = getChildIndex(node, getChildrenMode, children)
  return index > 0 && node.parent ? children[index - 1] : undefined
}

/**
 * Find the parent for given node that comply with given predicate.
 * @param orItSelf if true will first, check if node itself comply and if so returns it.
 */
export function findAscendant<T extends ts.Node>(node: ts.Node | undefined, predicate: (node: ts.Node) => boolean, orItSelf: boolean = false): T | undefined {
  if (!node) {
    return
  }
  else if (orItSelf && predicate(node)) {
    return node as T
  }
  else if (node.parent && predicate(node.parent)) {
    return node.parent as T
  }
  else {
    return findAscendant(node.parent as T, predicate)
  }
}

/** 
 * Gets given node's ascendants in order from node.parent to top most one .
 */
export function getAscendants(node: ts.Node | undefined): ts.Node[] {
  let a = node
  const result: ts.Node[] = []
  while ((a = a.parent)) {
    result.push(a)
  }
  return result
}

/**
 * Get the distance from given node to its ascendant .
 */
export function getDistanceToAncestor(node: ts.Node, ascendant: ts.Node): number{
  if(node===ascendant||!node||!ascendant){
    return 0
  }
  else {
    return getDistanceToAncestor(node.parent, ascendant) + 1
  }
}