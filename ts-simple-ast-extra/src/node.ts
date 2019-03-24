import { Node } from 'ts-morph'

/**
 * like Node.getChildren but using forEachChild(). TODO: perhaps is a good idea to add a useForEachChild to
 * ts-simple-ast getChildren that is optional but if provided do this ?
 */
export function getChildrenForEachChild(n: Node): Node[] {
  const result: Node[] = []
  n.forEachChild(n => result.push(n))
  return result
}

/**
 *  try to call n.getName or returns empty string if there is no such method
 *  @param n
 */
export function getName(n: Node): string {
  return (n as any).getName ? (n as any).getName() + '' : ''
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
