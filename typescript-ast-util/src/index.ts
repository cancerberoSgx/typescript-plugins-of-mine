import * as ts from 'typescript'
import * as ts_module from '../node_modules/typescript/lib/tsserverlibrary'
import { join, sep, dirname } from 'path';
import { appendFileSync, readFileSync } from 'fs';
import { StringLiteral } from '../node_modules/typescript/lib/tsserverlibrary';

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


// parent helpers
/**
 * Find the parent for given node that comply with iven predicate
 * @param node 
 * @param predicate 
 * @param orItSelf if true will first, check if node itself comply and if so returns it
 */
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
/**
 * Given a positionOrRange and a info context there is a node that is minimal and contains it (ChildContainingPosition). This method return the parent of that node that comply with given predicate
 * @param info 
 * @param fileName 
 * @param positionOrRange 
 * @param predicate 
 */
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
  // const childCount = parent.getChildCount()
  // for (let i = 0; i < childCount; i++) {
  //   const child = parent.getChildAt(i)
  //   if (predicate(child)) {
  //     children.push(child)
  //   }
  //   if (recursive) {
  //     const recursionResult = filterChildren(child, predicate, recursive, children)
  //     if (recursionResult) {
  //       console.log(children.length, recursionResult.length, getKindName(child.kind), child.getSourceFile().fileName, child.getFullText(), ts.getGeneratedNameForNode(child).escapedText)
  //       children = children.concat(recursionResult)
  //     }
  //   }
  // }
  parent.forEachChild(child=>{
    // if((child as any).__sebaMark){
    //   console.log('ya pasamos')
    //   return 
    // }
    // (child as any).__sebaMark=true
    if (predicate(child)) {
      children.push(child)
    }
    if (recursive) {
      const recursionResult = filterChildren(child, predicate, recursive, children)
      if (recursionResult) {
        // console.log(children.length, recursionResult.length, getKindName(child.kind), child.getSourceFile().fileName, child.getFullText(), ts.getGeneratedNameForNode(child).escapedText)
        children = children.concat(recursionResult)
      }
    }
  })
  return children
}

export function findChild(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false)
  : ts.Node | undefined {
  return findChild_(true, parent, predicate, recursive)
}

const findChildCache = {}

function findChild_(
  firstTime: boolean = false,
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false)
  : ts.Node | undefined {
  if (!parent) {
    return
  }
  const childCount = parent.getChildCount() // TODO: use  visitChildrenRecursiveDeepFirst
  for (let i = 0; i < childCount; i++) {
    const child: ts.Node | undefined = parent.getChildAt(i)
    // if(!!findChildCache[ts.getGeneratedNameForNode(child).escapedText+'']){
    //   continue
    // }
    // ts.getGeneratedNameForNode(node).escapedText
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






/// testing 

import * as shell from 'shelljs'
shell.config.silent = true
export function compileSource(sourceCode: string, tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): { project: ts.Program, fileName: string, tsconfigPath: string } {
  const fileName = shell.tempdir() + '/' + 'tmpFile_' + Date.now() + '.ts'
  shellWrite(sourceCode, fileName)
  return { project: compileFile(fileName, tsconfigPath), fileName, tsconfigPath }
}

const shellWrite = function (s: string, file: string): void {
  (shell as any).ShellString(s).to(file)
}

export function compileFile(fileName: string = '', tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath).toString())

  let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, dirname(tsconfigPath))
  if (errors.length) {
    throw errors
  }
  const compilerHost: ts.CompilerHost = {
    ...ts.createCompilerHost(options),
    getSourceFile: (fileName, languageVersion) => ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
  }
  return ts.createProgram([fileName], options, compilerHost);
}


export function compileProject(projectFolder: string, rootFiles: Array<string> = [], tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath).toString())
  if (tsConfigJson.error) {
    throw tsConfigJson.error
  }
  const compilerOptions = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, projectFolder, tsconfigPath)
  if (compilerOptions.errors.length) {
    throw compilerOptions.errors
  }
  const compilerHost: ts.CompilerHost = {
    ...ts.createCompilerHost(compilerOptions.options),
    getSourceFile: (fileName, languageVersion) => ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
  }
  return ts.createProgram(rootFiles, compilerOptions.options, compilerHost);
}


export function log(s: string) {
  const logFile = join(__dirname, 'test.log')
  appendFileSync(logFile, s)
}