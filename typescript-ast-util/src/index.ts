import * as ts from 'typescript'
import * as ts_module from 'typescript/lib/tsserverlibrary'
import { join, sep, dirname } from 'path';
import { appendFileSync, readFileSync } from 'fs';
import { StringLiteral } from 'typescript/lib/tsserverlibrary';

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
  parent.forEachChild(child => {
    if (predicate(child)) {
      children.push(child)
    }
    if (recursive) {
      const recursionResult = filterChildren(child, predicate, recursive, children)
      if (recursionResult) {
        children = children.concat(recursionResult)
      }
    }
  })
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
    let found:ts.Node|undefined
    if(recursive){
      visitChildrenRecursiveDeepFirst(parent, child=>{
        if (predicate(child)) {
          found= child
        }
      })
    }
    else {
      parent.forEachChild(child => {
        if(predicate(child)){
          found = child
        }
      })
    }
    return found
}

/**
 * this iterated less childs than findChild, we don't understand why yet...
 */
export function findChild2(
  parent: ts.Node | undefined,
  predicate: (child: ts.Node) => boolean,
  recursive: boolean = false)
  : ts.Node | undefined {if (!parent) {
    return
  }
  let found:ts.Node|undefined
  if(recursive){
    visitChildrenRecursiveDeepFirst(parent, child=>{
      if (predicate(child)) {
        found= child
      }
      if (!found && recursive) {
        found = findChild2(child, predicate, recursive)       
      }
    })
  }
  else {
    parent.forEachChild(child => {
      if(predicate(child)){
        found = child
      }
    })
  }
  return found
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
    const name = node.kind===ts.SyntaxKind.Identifier ? ((node as ts.Identifier).text+' ') : '';
    let shortText = node.getText().split('\n').join('\\n')
    shortText = shortText.substr(0, Math.min(shortText.length, 20))
    buffer.push(`${indent} #${index} ${name}${getKindName(node.kind)}  ("${shortText}")`)
  }
  const buffer: Array<string> = []
  visitChildrenRecursiveDeepFirst(ast, print)
  return buffer.join('\n')
}






/// testing 

import * as shell from 'shelljs'
import { homedir } from 'os';
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
  const logFile = join(homedir(), 'typescript-ast-util.log')
  appendFileSync(logFile, s)
}