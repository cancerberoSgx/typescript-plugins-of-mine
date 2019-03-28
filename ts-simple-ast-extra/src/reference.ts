import { notUndefined } from 'misc-utils-of-mine-typescript'
import { Identifier, Node, SyntaxKind } from 'ts-morph'

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
