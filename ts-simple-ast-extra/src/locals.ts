import { notFalsy } from 'misc-utils-of-mine-generic'
import { Node, ts, TypeGuards } from 'ts-morph'

/**
 * Unstable API. Uses TS internals!
 */
export function getNodeLocalNames(target: Node) {
  return getLocals(target).map(s => s.escapedName.toString())
}

/**
 * Unstable API. Uses TS internals!
 */
export function getNodeLocalsNotReferencing(target: Node, notReferencing: Node | string) {
  const name =
    typeof notReferencing === 'string'
      ? notReferencing
      : TypeGuards.hasName(notReferencing)
        ? notReferencing.getName()
        : undefined
  if (!name) {
    throw 'notReferencing not must have a name'
  }
  return getLocals(target).filter(
    l => (l.declarations && l.declarations.length && l.declarations[0].getText()) !== name
  )
}

/**
 * Unstable API. Uses TS internals!
 */
export function getNodeLocalsDeclarations(target: Node): ts.Declaration[] {
  return getLocals(target)
    .map(l => l.declarations && l.declarations)
    .flat()
    .filter(notFalsy)
}

/**
 * Unstable API. Uses TS internals!
 */
export function getNodeLocalNamesNotReferencing(target: Node, notReferencing: Node | string) {
  return getNodeLocalsNotReferencing(target, notReferencing).map(n => n.escapedName.toString())
}

/**
 * Unstable API. Uses TS internals!
 */
export function getLocals(n: Node): Symbol[] {
  const locals = (n.compilerNode as any)['locals'] as ts.SymbolTable
  if (!locals) {
    return []
  }
  const r = (Array.from(locals.entries() as any) as any[]).map(s => s[1])
  return r as Symbol[]
}

interface Symbol {
  flags: ts.SymbolFlags
  escapedName: ts.__String
  declarations: ts.Declaration[]
  valueDeclaration: ts.Declaration
  members?: ts.SymbolTable
  exports?: ts.SymbolTable
  globalExports?: ts.SymbolTable
}
