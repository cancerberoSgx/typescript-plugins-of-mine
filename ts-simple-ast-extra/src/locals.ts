import { Node, SyntaxKind, ts, TypeGuards } from 'ts-morph'
import { notFalsy } from './misc'

export function getNodeName(n: Node) {
  const id = n.getFirstChildByKind(SyntaxKind.Identifier)
  return id ? id.getText() : undefined
}

export function getNodeLocalNames(target: Node) {
  return getLocals(target).map(s => s.escapedName.toString())
}

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

export function getNodeLocalsDeclarations(target: Node): ts.Declaration[] {
  return getLocals(target)
    .map(l => l.declarations && l.declarations)
    .flat()
    .filter(notFalsy)
}

export function getNodeLocalNamesNotReferencing(target: Node, notReferencing: Node | string) {
  return getNodeLocalsNotReferencing(target, notReferencing).map(n => n.escapedName.toString())
}

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
