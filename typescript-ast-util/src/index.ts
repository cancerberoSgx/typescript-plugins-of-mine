import { appendFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
/// testing 
import * as shell from 'shelljs';
import * as ts from 'typescript';
import * as ts_module from 'typescript/lib/tsserverlibrary';




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
  let found:ts.Node = parent.getChildren().find(node => r.pos >= node.getFullStart() && r.end <= node.getEnd()) 
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
  sourceFile : ts_module.SourceFile|undefined,
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
  getChildrenMode:boolean=false
): ts.Node | undefined 
  {
  if (!node) {
    return
  }
  const result = visitor(node, index, level);
  if (stopOnTruthy && result) {
    return result
  }
  let i = 0
  if(!getChildrenMode){
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

/**
 * 
 * @param files useful for creating in-memory programs for testing or using APIs without having to access FS
 * @param compilerOptions 
 */
export function createProgram(files: {fileName: string, content: string, sourceFile? : ts.SourceFile}[], compilerOptions?: ts.CompilerOptions): ts.Program{
  const tsConfigJson = ts.parseConfigFileTextToJson('tsconfig.json', compilerOptions ? JSON.stringify(compilerOptions) : `{
    "compilerOptions": {
      "target": "es2018",   
      "module": "commonjs", 
      "lib": ["es2018"],
      "rootDir": ".",
      "strict": false,   
      "esModuleInterop": true,
    }
  }`)
  let {options, errors} = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, '.')
  if(errors.length){
    throw errors
  }
  const compilerHost = ts.createCompilerHost(options)
  compilerHost.getSourceFile = function(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string)=> void, shouldCreateNewSourceFile?: boolean): ts.SourceFile | undefined {
    const file = files.find(f=>f.fileName===fileName)
    if(!file)return undefined
    file.sourceFile = file.sourceFile ||  ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES2015, true)
    return file.sourceFile
  }
  return ts.createProgram(files.map(f=>f.fileName), options, compilerHost)
}


/** return the first diagnosis */
export function getDiagnosticsInCurrentLocation(program: ts.Program, sourceFile: ts.SourceFile, position: number): ts.Diagnostic[] {
  // const file = typeof sourceFile === 'string' ? program.getSourceFile(sourceFile) : sourceFile;
  const diagnostics = [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getDeclarationDiagnostics()
  ];
  return position===-1 ? diagnostics : diagnostics.filter(d => d.start <= position && position <= d.start + d.length);
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

export function dumpAst(ast: ts.Node | undefined, getChildrenMode:boolean=false, printIndex:boolean=false): string {
  if (!ast) {
    return ''
  }
  function print(node: ts.Node, index: number = 0, level: number = 0) {
    buffer.push(printNode(node, index, level, printIndex))
  }
  const buffer: string[] = []
  visitChildrenRecursiveDeepFirst(ast, print, undefined, undefined, false, getChildrenMode)
  return buffer.join('\n')
}

export function printNode(node: ts.Node, index: number = -1, level: number = 0, printIndex:boolean=false): string {
  const indent = new Array(level).map(i => '').join('  ')
  const name = node.kind === ts.SyntaxKind.Identifier ? ((node as ts.Identifier).text + ' ') : '';
  const indexStr = printIndex ? (index != -1 ? ('#' + index + ' ') : '') : ''
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




// const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
// const isNotExpression = node => !isExpression(node)
// const isStatement = node => getKindName(node).endsWith('Statement')
// const isStatementContainer = n => getKindName(n).endsWith('Block') || n.kind === ts.SyntaxKind.SourceFile
export const dumpNode = (node: ts.Node) => node ? (getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText().replace(/\s+/g, ' ').substring(0, Math.min(30, node.getText().length))+'...') : 'undefined'
export const dumpNodes = (nodes: ts.Node[]) => nodes.map(dumpNode).join('\n')
