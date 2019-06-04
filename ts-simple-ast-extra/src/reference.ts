import { Identifier } from 'ts-morph'
import { notUndefined } from 'misc-utils-of-mine-generic'

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
