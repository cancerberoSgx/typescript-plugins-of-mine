import { appendFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
/// testing 
import * as shell from 'shelljs';
import * as ts from 'typescript';
// import * as ts_module from 'typescript/lib/tsserverlibrary';




// position & range helpers
/** given a positionOrRange (common when developing LanguageServicePlugins) it will return en equivalent Range  */
export function positionOrRangeToRange(positionOrRange: number | ts.TextRange): ts.TextRange {
  return typeof positionOrRange === 'number'
    ? { pos: positionOrRange, end: positionOrRange }
    : positionOrRange
}
/** given a positionOrRange (common when developing LanguageServicePlugins) it will return en equivalent number  */
export function positionOrRangeToNumber(positionOrRange: number | ts.TextRange): number {
  return typeof positionOrRange === 'number' ?
    positionOrRange :
    (positionOrRange as ts.TextRange).pos
}

// node accessors and guards


/** Gets the JSDoc of any node. For performance reasons this function should only be called when `canHaveJsDoc` return true. */
export function getJsDoc(node: ts.Node, sourceFile?: ts.SourceFile): ts.JSDoc[] {
  const result = [];
  for (const child of node.getChildren(sourceFile)) {
    if (child.kind !== ts.SyntaxKind.JSDocComment)
      break;
    result.push(child)
  }
  return result as ts.JSDoc[]
}
export function isDeclaration(node: ts.Node): boolean {
  return getKindName(node.kind).endsWith('Declaration')
}
export function hasName(node: ts.Node): boolean {
  return !!(node as ts.NamedDeclaration).name
}

// get node by position or range helpers


export function findChildContainingPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart() && position < node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}

//TODO rename to findLowestChildContainingRange
export function findChildContainingRange(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (r.pos >= node.getStart() && r.end < node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}
// same as findChildContainingRange but nto so strict r.pos <= n.start <=  r.end <= n.end
export function findChildContainingRangeLight(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (r.pos >= node.getStart() && r.end <= node.getEnd()) {
      return ts.forEachChild(node, find) || node
    }
  }
  return find(sourceFile)
}
export function findChildContainingRangeGetChildren(parent: ts.Node, r: ts.TextRange): ts.Node | undefined {
  // let found:ts.Node = parent
  let found: ts.Node = parent.getChildren().find(node => r.pos >= node.getFullStart() && r.end <= node.getEnd())
  return found && findChildContainingRangeGetChildren(found, r) || parent
}

//TODO. rename to findFirstChildContainedRange
export function findChildContainedRange(sourceFile: ts.SourceFile, r: ts.TextRange): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (r.pos <= node.getStart() && r.end >= node.getEnd()) {
      return node
    }
    else {
      return ts.forEachChild(node, find)
    }

  }
  return find(sourceFile)
}
/**
 * Given a positionOrRange and a info context there is a node that is minimal and contains it (ChildContainingPosition). This method return the parent of that node that comply with given predicate
 * @param info 
 * @param fileName 
 * @param positionOrRange 
 * @param predicate 
 */
export function findParentFromPosition(
  sourceFile: ts.SourceFile | undefined,
  positionOrRange: number | ts.TextRange,
  predicate: (node: ts.Node) => boolean)
  : ts.Node | undefined {
  // const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return
  }
  const nodeAtCursor = findChildContainingPosition(sourceFile, positionOrRangeToNumber(positionOrRange))
  if (!nodeAtCursor) {
    return
  }
  const targetNode = findAscendant(nodeAtCursor, predicate, true)
  return targetNode || undefined
}






// parent helpers
/**
 * Find the parent for given node that comply with given predicate
 * @param orItSelf if true will first, check if node itself comply and if so returns it
 */
export function findAscendant<T extends ts.Node>(node: ts.Node | undefined, predicate: (node: ts.Node) => boolean, orItSelf: boolean = false): T | undefined {
  if (!node) {
    return
  }
  else if (orItSelf && predicate(node)) {
    return node as T
  }
  else if (node.parent && predicate(node.parent)) {
    return node.parent as T
  }
  else {
    return findAscendant(node.parent as T, predicate)
  }
}

/** get given node's ascendants in order from node.parent to topest one */
export function getAscendants(node: ts.Node | undefined): ts.Node[] {
  let a = node
  const result: ts.Node[] = []
  while ((a = a.parent)) {
    result.push(a)
  }
  return result
}



// kind & type helpers
/** get the kind name as string of given kind value or node */
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

let syntaxKindMap: { [x: string]: number } | undefined = undefined

export function syntaxKindToMap(): { [x: string]: number } {
  if (!syntaxKindMap) {
    syntaxKindMap = {}
    for (var i in ts.SyntaxKind) {
      const parsed = parseInt(i)
      if (parsed || parsed === 0) {
        syntaxKindMap[ts.SyntaxKind[i]] = parsed
      }
    }
  }
  return syntaxKindMap
}


let typeFormatFlagsMap: { [x: string]: number } | undefined = undefined

export function typeFormatFlagsToMap(): { [x: string]: number } {
  if (!typeFormatFlagsMap) {
    typeFormatFlagsMap = {}
    for (var i in ts.TypeFormatFlags) {
      const parsed = parseInt(i)
      if (parsed || parsed === 0) {
        typeFormatFlagsMap[ts.TypeFormatFlags[i]] = parsed
      }
    }
  }
  return typeFormatFlagsMap
}

export function getTypeStringFor(node: ts.Node, program: ts.Program): string | undefined {
  const type = getTypeFor(node, program)
  if (!type) {
    return
  }
  return program.getTypeChecker().typeToString(type, node, ts.TypeFormatFlags.None) || undefined
}
/**
 * because getTypeStringFor returns type strings not suitable for declarations, for example, for function like, returns "(args)=>Foo" where for declarations it should be (args):Foo
 */
export function getTypeStringForDeclarations(node: ts.Node, program: ts.Program): string {
  let newText = getTypeStringFor(node, program)
  if (ts.isFunctionLike(node)) {
    const result = /\(\s*\)\s*=>/.exec(newText)
    if (result && result.length) {
      newText = newText.substring(result.index + result[0].length, newText.length)
    }
  }
  else if (!isDeclaration(node) || ts.isVariableDeclaration(node)) {
    //no nothing, default value for newText seems to be doing fine
  }
  return newText
}

export function getTypeFor(node: ts.Node, program: ts.Program): ts.Type {
  return program.getTypeChecker().getTypeAtLocation(node)
}
export function hasDeclaredType(node: ts.Node, program: ts.Program): boolean {
  if (!(node as any).type) {
    return false;
  }
  const type = program.getTypeChecker().getTypeAtLocation(node)
  if (!type || !type.symbol) {
    return false
  } else {
    return true
  }
}


// children helpers

/**
 * Iterates recursively over all children of given node and apply visitor on each of them. If visitor returns non falsy value then it stops visiting and that value is returned to the caller. See https://en.wikipedia.org/wiki/Tree_traversal for the meaning of "DeepFirst". 
 */
export function visitChildrenRecursiveDeepFirst(
  node: ts.Node,
  visitor: (node: ts.Node, index?: number, level?: number) => ts.Node | undefined | void,
  index: number = 0,
  level: number = 0,
  stopOnTruthy: boolean = false,
  getChildrenMode: boolean = false
): ts.Node | undefined {
  if (!node) {
    return
  }
  const result = visitor(node, index, level);
  if (stopOnTruthy && result) {
    return result
  }
  let i = 0
  if (!getChildrenMode) {
    return node.forEachChild(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1, stopOnTruthy, getChildrenMode))
  } else {
    node.getChildren().forEach(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1, stopOnTruthy, getChildrenMode))
  }
}

export function filterChildren(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = true,
  children: Array<ts.Node> = [])
  : Array<ts.Node> {

  if (!parent) {
    return []
  }
  if (!recursive) {
    ts.forEachChild(parent, child => {
      if (predicate(child)) {
        children.push(child)
      }
    })
  } else {
    visitChildrenRecursiveDeepFirst(parent, child => {
      if (predicate(child)) {
        children.push(child)
      }
    })
  }
  return children
}

export function findChild(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = true)
  : ts.Node | undefined {
  if (!parent) {
    return
  }
  let found: ts.Node | undefined
  if (recursive) {
    visitChildrenRecursiveDeepFirst(parent, child => {
      if (predicate(child)) {
        found = child
      }
    })
  }
  else {
    parent.forEachChild(child => {
      if (predicate(child)) {
        found = child
      }
    })
  }
  return found
}

/**
 * this iterated less child than findChild, we don't understand why yet... we need this because makes plugin-subclasses-of work (for some reason)
 */
export function findChild2(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false)
  : ts.Node | undefined {
  if (!parent) {
    return
  }
  let found: ts.Node | undefined
  if (recursive) {
    visitChildrenRecursiveDeepFirst(parent, child => {
      if (predicate(child)) {
        found = child
      }
    })
  }
  else {
    found = parent.forEachChild(child => {
      return predicate(child) && child
    })
  }
  return found
}


export function getChildren(node: ts.Node | undefined, getChildrenMode: boolean = false): ts.Node[] {
  if (!node) {
    return []
  }
  if (getChildrenMode) {
    return node.getChildren()
  }
  const result: ts.Node[] = []
  node.forEachChild(c => {
    result.push(c)
  })
  return result
}
/**
 * @param children if caller already have called getChildren he can pass it here so this call is faster
 */
export function getChildIndex(node: ts.Node, getChildrenMode: boolean = false, children: ts.Node[] | undefined = undefined): number {
  let result = -1
  node.parent && (children || getChildren(node.parent, getChildrenMode)).find((c, i) => {
    if (c === node) {
      result = i
      return true
    }
  })
  return result
}
export function getNextSibling(node: ts.Node, getChildrenMode: boolean = false): ts.Node | undefined {
  const children = getChildren(node.parent, getChildrenMode)
  const index = getChildIndex(node, getChildrenMode, children)
  return node.parent && index < children.length - 1 ? children[index + 1] : undefined
}
export function getPreviousSibling(node: ts.Node, getChildrenMode: boolean = false): ts.Node | undefined {
  const children = getChildren(node.parent, getChildrenMode)
  const index = getChildIndex(node, getChildrenMode, children)
  return index > 0 && node.parent ? children[index - 1] : undefined
}




// identifiers helpers

export function findIdentifier(node: ts.Node | undefined): ts.Identifier {
  return node.kind === ts.SyntaxKind.Identifier ? node as ts.Identifier : findChild(node, child => child.kind === ts.SyntaxKind.Identifier, false) as ts.Identifier
}
export function findIdentifierString(node: ts.Node | undefined): string {
  const id = findIdentifier(node)
  return id && id.escapedText ? id.escapedText + '' : ''
}


export * from './compilation'
export * from './debugAndLogging'
export * from './sourceFileManipulation'