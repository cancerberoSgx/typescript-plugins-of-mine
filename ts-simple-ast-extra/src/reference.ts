import { notUndefined, notFalsy } from 'misc-utils-of-mine-typescript'
import { Identifier } from 'ts-morph'

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
