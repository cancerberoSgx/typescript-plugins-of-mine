import { notUndefined, notFalsy } from 'misc-utils-of-mine-typescript'
import { Identifier, Node, SyntaxKind, TypeGuards, ts } from 'ts-morph'

export function getDefinitionsOf(id: Identifier) {
  return id
    .findReferences()
    .map(r =>
      r
        .getDefinition()
        .getNode()
        .getParent()
    )
    .filter(notUndefined)
}

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
  // const f = notReferencing.compilerNode.getSourceFile()
  // return getLocals(target)
  //   .filter(l => (l.declarations || [])
  //     .find(d => d.getSourceFile() === f && d.getText() === notReferencing.getName()))
  return getLocals(target).filter(l => {
    // console.log(l.declarations &&  l.declarations.length &&  l.declarations[0].getText(), notReferencing.getName());

    return (l.declarations && l.declarations.length && l.declarations[0].getText()) !== notReferencing.getName()
  })
}

export function getNodeLocalNamesNotReferencing(target: Node, notReferencing: Node) {
  return getNodeLocalsNotReferencing(target, notReferencing).map(n => n.escapedName.toString())
}

export function getLocals(n: Node) {
  const locals = (n.compilerNode as any)['locals'] as ts.SymbolTable
  const r = (Array.from(locals.entries() as any) as any[])
    // .flat()
    .map(s => s[1])
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
