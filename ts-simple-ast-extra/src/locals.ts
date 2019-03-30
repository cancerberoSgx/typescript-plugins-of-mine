import { Node, SyntaxKind, TypeGuards, ts } from 'ts-morph'
import { notFalsy } from 'misc-utils-of-mine-typescript'

export function getNodeName(n: Node) {
  const id = n.getFirstChildByKind(SyntaxKind.Identifier)
  return id ? id.getText() : undefined
}

export function getNodeLocalNames(target: Node) {
  return getLocals(target).map(s => s.escapedName.toString())
}

export function getNodeLocalsNotReferencing(target: Node, notReferencing: Node) {
  if (!TypeGuards.hasName(notReferencing)) {
    throw 'notReferencing not must have a name'
  }
  return getLocals(target).filter(
    l => (l.declarations && l.declarations.length && l.declarations[0].getText()) !== notReferencing.getName()
  )
}

export function getNodeLocalsDeclarations(target: Node) : ts.Declaration[] {
  return getLocals(target)
    .map(l => l.declarations && l.declarations)
    .flat()
    .filter(notFalsy)
}

export function getNodeLocalNamesNotReferencing(target: Node, notReferencing: Node) {
  return getNodeLocalsNotReferencing(target, notReferencing).map(n => n.escapedName.toString())
}

export function getLocals(n: Node) : Symbol[]{
  const locals = (n.compilerNode as any)['locals'] as ts.SymbolTable
  if (!locals) {
    return []
  }
  const r = (Array.from(locals.entries() as any) as any[]).map(s => s[1])
  return r as Symbol[]
}

// export function getReferencesIn(n:Node): ts.Declaration[]{
//   const r = [...n.getDescendants(), n]
//   // .filter(isDeclaration)
//   .filter(TypeGuards.isTypeReferenceNode)
//   // .map(n=>getNodeLocalsDeclarations(n))
//   // .flat()
//   // .filter(notFalsy)
//   return r
// }

interface Symbol {
  flags: ts.SymbolFlags
  escapedName: ts.__String
  declarations: ts.Declaration[]
  valueDeclaration: ts.Declaration
  members?: ts.SymbolTable
  exports?: ts.SymbolTable
  globalExports?: ts.SymbolTable
}
