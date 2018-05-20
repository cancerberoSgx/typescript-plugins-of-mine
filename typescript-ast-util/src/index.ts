import { appendFileSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { dirname, join } from 'path'

/// testing 
import * as shell from 'shelljs'
import * as ts from 'typescript'
import * as ts_module from 'typescript/lib/tsserverlibrary'



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





// parent helpers
/**
 * Find the parent for given node that comply with given predicate
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


// kind & type helpers

export function getKindName(kind: number): string {
  return getEnumKey(ts.SyntaxKind, kind)
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
  // ts_module.server.get
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
 * Iterates recursively over all children of given node and apply visitor on each of them. If visitor returns non falsy value then it stops visiting and that value is returned to the caller. See https://en.wikipedia.org/wiki/Tree_traversal for the meaning of "DeepFirst". 
 */
export function visitChildrenRecursiveDeepFirst(node: ts.Node,
  visitor: (node: ts.Node, index?: number, level?: number) => ts.Node | undefined | void, index: number = 0, level: number = 0, stopOnTruthy: boolean = false): ts.Node | undefined {
  if (!node) {
    return
  }
  const result = visitor(node, index, level);
  if (stopOnTruthy && result) {
    return result
  }
  let i = 0
  return node.forEachChild(child => visitChildrenRecursiveDeepFirst(child, visitor, i++, level + 1))
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
// function printDiagnostic(d: ts.Diagnostic) {
//   return ts.formatDiagnosticsWithColorAndContext()
//   const character = ts.getLineAndCharacterOfPosition(d.file, d.start).character
//   const line = ts.getLineAndCharacterOfPosition(d.file, d.start).line
//   const lineStr = d.file.getText().split('\n')[line - 1]
//   return return ts.formatDiagnosticsWithColorAndContext() 'Diagnostic: ' + d.code + ' ' + d.messageText + '  line: ' + line + ' - ' + d.file.fileName + ' line is: \n' + lineStr + '\n' + new Array(Math.min(0, character - 3)).map(i => '').join(' ') + '|here|'
// }

//identifiers helpers

export function findIdentifier(node: ts.Node | undefined): ts.Identifier {
  return node.kind === ts_module.SyntaxKind.Identifier ? node as  ts.Identifier :    findChild(node, child => child.kind === ts_module.SyntaxKind.Identifier, false) as ts.Identifier
}
export function findIdentifierString(node: ts.Node | undefined): string {
  const id = findIdentifier(node)
  return id && id.escapedText ? id.escapedText + '' : ''
}
// compilation

export function compileFile(fileName: string = '', tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath).toString())
  if (tsConfigJson.error) {
    throw tsConfigJson.error
  }
  let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, dirname(tsconfigPath))
  if (errors.length) {
    throw errors
  }
  const compilerHost: ts.CompilerHost = {
    ...ts.createCompilerHost(options),
    getSourceFile: (fileName, languageVersion) => ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
  }
  const program = ts.createProgram([fileName], options, compilerHost);
  // const diagnotics =   program.getSyntacticDiagnostics()
  ts.formatDiagnosticsWithColorAndContext(program.getSyntacticDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getDeclarationDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getGlobalDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getSemanticDiagnostics(), compilerHost)
  //
  // .forEach(d => {
    
  //   program.getSyntacticDiagnostics().forEach(d => console.log(printDiagnostic(d)))
  // })
  return program
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
  const program = ts.createProgram(rootFiles, compilerOptions.options, compilerHost);

  ts.formatDiagnosticsWithColorAndContext(program.getSyntacticDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getDeclarationDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getGlobalDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getSemanticDiagnostics(), compilerHost)
  // program.getSyntacticDiagnostics().forEach(d => console.log(printDiagnostic(d)))
  return program

}



// source file manipulation

/**
 * @param sourceFile 
 * @param positionWhereToAdd (spanStart)
 * @param textToAdd 
 * @return the sourceFile with the modifications
 */
export function addTextToSourceFile(sourceFile: ts.SourceFile, positionWhereToAdd: number, textToAdd: string, charCountToDeleteFromPos: number = 0): ts.SourceFile {
  const spanLength = charCountToDeleteFromPos // not removing 
  const oldTextLength = sourceFile.text.length
  const newText = sourceFile.text.substring(0, positionWhereToAdd) + textToAdd + sourceFile.text.substring(positionWhereToAdd, sourceFile.text.length)
  // forcing the newLength so ts asserts wont fail:
  // ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length)
  const newLength = spanLength + newText.length - sourceFile.text.length
  return ts.updateSourceFile(sourceFile, newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength }, true)
  // return sourceFile.update(newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength })
}





// debug& logging

export function dumpAst(ast: ts.Node | undefined): string {
  if (!ast) {
    return ''
  }
  function print(node: ts.Node, index: number = 0, level: number = 0) {
    buffer.push(printNode(node, index, level))
  }
  const buffer: Array<string> = []
  visitChildrenRecursiveDeepFirst(ast, print)
  return buffer.join('\n')
}

export function printNode(node: ts.Node, index: number = -1, level: number = 0): string {
  const indent = new Array(level).map(i => '').join('  ')
  const name = node.kind === ts.SyntaxKind.Identifier ? ((node as ts.Identifier).text + ' ') : '';
  const indexStr = index != -1 ? ('#' + index + ' ') : ''
  let shortText = node.getText().replace(/[\s\n]+/g, ' ')//.split(//).join('\\n')
  shortText = shortText.substr(0, Math.min(shortText.length, 60))
  return `${indent}${indexStr}${name}${getKindName(node.kind)} : "${shortText}"`
}

export function log(s: string) {
  const logFile = join(homedir(), 'typescript-ast-util.log')
  appendFileSync(logFile, s)
}
const shellWrite = function (s: string, file: string): void {
  (shell as any).ShellString(s).to(file)
}



shell.config.silent = true
export function compileSource(sourceCode: string, tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): { program: ts.Program, fileName: string, tsconfigPath: string } {
  const fileName = shell.tempdir() + '/' + 'tmpFile_' + Date.now() + '.ts'
  shellWrite(sourceCode, fileName)
  return { program: compileFile(fileName, tsconfigPath), fileName, tsconfigPath }
}



// ts-simple-ast

/** gets the config file of given ts project or undefined if given is not a ConfiguredProject */
function getConfigFilePath(project: ts_module.server.Project): string|undefined {
  if((project as ts_module.server.ConfiguredProject).getConfigFilePath){
    return (project as ts_module.server.ConfiguredProject).getConfigFilePath()
  }
}
/** dirty way of creating a ts-simple-ast Project from an exiting ts.server.Project */
function createSimpleASTProject(project: ts_module.server.Project): Project {
  return new Project({
    tsConfigFilePath: getConfigFilePath(info.project)
  });
}

  