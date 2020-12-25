import * as ts from 'typescript';
import { appendFileSync, writeFileSync } from "fs";
import { join } from "path";

export function log(...args: any) {
  function print(s: any) {
    if (['number', 'string', 'boolean'].includes(typeof s) || s === undefined || s === null) {
      return s + ''
    }
    else if (typeof s.kind === 'number') {
      return printNode(s)
    }
    else {
      return JSON.stringify(s)
    }
  }
  appendFileSync(join(process.env.HOME, '.plugin-scratch-log.txt'), args.map(print).join(' ') + '\n')
}

export function printNode(node: ts.Node) {
  return `${getKindName(node)} ${node.getText()}`
}

export function getKindName(kind: number | ts.Node): string {
  return (kind || kind === 0) ? getEnumKey(ts.SyntaxKind, (kind as ts.Node).kind || kind) : 'undefined'
}

export function getEnumKey(anEnum: any, value: any): string {
  for (const key in anEnum) {
    if (value === anEnum[key]) {
      return key
    }
  }
  return ''
}

export function findDescendantInPosition(parent: ts.Node, position: number): ts.Node | undefined {
  return findDescendant(parent, node => position >= node.getStart() && position <= node.getEnd())
}

export function findDescendant(parent: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (predicate(node)) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(parent)
}

export function toRange(positionOrRange: number | ts.TextRange) {
  if (typeof positionOrRange === 'number') {
    return { pos: positionOrRange, end: positionOrRange }
  } else {
    return positionOrRange
  }
}
