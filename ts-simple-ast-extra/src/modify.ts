import { quote } from 'misc-utils-of-mine-generic'
import { ArrayLiteralExpression, ObjectLiteralExpression } from 'ts-morph'

export function array2DInsert(init: ArrayLiteralExpression, fileId: number, index: number, data: string[]) {
  ensureArrayLength(init, fileId + 1, `[]`)
  init.removeElement(fileId)
  const newEl = init.insertElement(fileId, `[]`) as ArrayLiteralExpression
  data.forEach(d => {
    newEl.addElement(d)
  })
}

/** makes sure there are items until index-1 (se we can add the index-th) */
export function ensureArrayLength(a: ArrayLiteralExpression, index: number, item: string) {
  if (index >= a.getElements().length) {
    for (let i = a.getElements().length; i < index; i++) {
      a.addElement(item)
    }
  }
}

export function objectLiteralInsert(
  init: ObjectLiteralExpression,
  fileId: number,
  objectLiteral: { [n: string]: any }
) {
  //TODO: check if property assignment already exists
  init.addPropertyAssignments(
    Object.keys(objectLiteral).map(name => ({
      name: quote(name),
      initializer: objectLiteral[name]
    }))
  )
}
