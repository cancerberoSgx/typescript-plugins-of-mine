import * as ts from 'typescript'
import { getId } from '../src'
import { getKindName } from 'typescript-ast-util'
import { fromNow } from 'hrtime-now'

export function logTime<T>(fn: () => T) {
  return fromNow(fn, (t, hint) => console.log(`Function ${hint} took ${t}`))
}

export function printNode(n: ts.Node, level: number = 0, index: number, parentNode: ts.Node): string {
  const text = n.getText()
  return `${new Array(level * 2).fill(' ').join('')}${getKindName(n.kind)}" - id: ${getId(n)} ${text.substring(0, Math.min(text.length, 20))}`
}
