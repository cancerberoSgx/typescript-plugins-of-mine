import { Node } from 'ts-simple-ast';


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
  return (n as any).getName ? ((n as any).getName() + '') : ''
} 


