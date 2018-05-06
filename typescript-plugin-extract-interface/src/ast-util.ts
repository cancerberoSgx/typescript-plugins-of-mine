import * as ts from 'typescript'
import * as ts_module from '../node_modules/typescript/lib/tsserverlibrary'
import { join } from 'path';
import { appendFileSync } from 'fs';
import { StringLiteral } from '../node_modules/typescript/lib/tsserverlibrary';

// position & range helpers

export function positionOrRangeToRange(positionOrRange: number | ts.TextRange): ts.TextRange {
  return typeof positionOrRange === 'number'
    ? { pos: positionOrRange, end: positionOrRange }
    : positionOrRange
}
export function positionOrRangeToNumber(positionOrRange: number | ts.TextRange): number {
  return typeof positionOrRange === 'number' ?
    positionOrRange :
    (positionOrRange as ts.TextRange).pos
}


// parent helpers

export function findParent(node: ts.Node | undefined, predicate: (node: ts.Node) => boolean, orItSelf: boolean = false): ts.Node | undefined {
  if (!node) {
    return
  }
  if (orItSelf && predicate(node)) {
    return node
  }
  if (node && node.parent && predicate(node.parent)) {
    return node.parent
  }
  return findParent(node.parent as ts.Node, predicate)
}

export function findParentFromPosition(
  info: ts_module.server.PluginCreateInfo,
  fileName: string,
  positionOrRange: number | ts.TextRange,
  predicate: (node: ts.Node) => boolean)
  : ts.Node | undefined {
  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return
  }
  const nodeAtCursor = findChildContainingPosition(sourceFile, positionOrRangeToNumber(positionOrRange))
  if (!nodeAtCursor) {
    return
  }
  const targetNode = findParent(nodeAtCursor, predicate, true)
  return targetNode || undefined
}


// kind helpers

export function getKindName(kind: number): string {
  return getEnumKey(ts.SyntaxKind, kind)
}
function getEnumKey(anEnum: any, value: any): string {
  for (const key in anEnum) {
    if (value === anEnum[key]) {
      return key
    }
  }
  return ''
}



// children helpers

export function findChildContainingPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart() && position < node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}

/**https://en.wikipedia.org/wiki/Tree_traversal : for the meaning of "DeepFirst" */
export function visitChildrenRecursiveDeepFirst(node: ts.Node, visitor: (node: ts.Node, index?: number, level?: number) => void, index: number = 0, level: number = 0) {
  if (!node) {
    return
  }
  visitor(node, index, level);
  let i = 0
  node.forEachChild(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1))
}

export function filterChildren(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false,
  children: Array<ts.Node> = [])
  : Array<ts.Node> {
  if (!parent) {
    return []
  }
  const childCount = parent.getChildCount()
  for (let i = 0; i < childCount; i++) {
    const child = parent.getChildAt(i)
    if (predicate(child)) {
      children.push(child)
    }
    if (recursive) {
      const recursionResult = filterChildren(child, predicate, recursive, children)
      if (recursionResult) {
        children = children.concat(recursionResult)
      }
    }
  }
  return children
}

export function findChild(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false)
  : ts.Node | undefined {
  if (!parent) {
    return
  }
  const childCount = parent.getChildCount()
  for (let i = 0; i < childCount; i++) {
    const child = parent.getChildAt(i)
    if (predicate(child)) {
      return child
    }
    if (recursive) {
      const recursionResult = findChild(child, predicate, recursive)
      if (recursionResult) {
        return recursionResult
      }
    }
  }
}


//identifiers helpers

export function findIdentifier(node: ts.Node | undefined): ts.Identifier {
  return findChild(node, child => child.kind === ts_module.SyntaxKind.Identifier) as ts.Identifier
}
export function findIdentifierString(node: ts.Node | undefined): string {
  const id = findIdentifier(node)
  return id && id.escapedText ? id.escapedText + '' : ''
}




// miscellaneous

export function dumpAst(ast: ts.Node | undefined): string {
  if (!ast) {
    return ''
  }
  function print(node: ts.Node, index: number = 0, level: number = 0) {
    const indent = new Array(level).map(i => '').join('  ')
    const id = findChild(node, child => child.kind === ts_module.SyntaxKind.Identifier) as ts.Identifier
    buffer.push(`${indent} #${index} ${findIdentifierString(node)} ${getKindName(node.kind)}`)
  }
  const buffer: Array<string> = []
  visitChildrenRecursiveDeepFirst(ast, print)
  return buffer.join('\n')
}




export function log(s:string){
const logFile = join(__dirname, 'test.log')
appendFileSync(logFile,s)
}