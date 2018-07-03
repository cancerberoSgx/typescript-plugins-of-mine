import { appendFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import * as shell from 'shelljs';
import * as ts from 'typescript';
import { visitChildrenRecursiveDeepFirst, getKindName } from '.';
import { compileFile } from './compilation';



// debug& logging

export function dumpAst(ast: ts.Node | undefined, getChildrenMode: boolean = false, printIndex: boolean = false): string {
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

export function printNode(node: ts.Node, index: number = -1, level: number = 0, printIndex: boolean = false): string {
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
export const dumpNode = (node: ts.Node) => node ? (getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText().replace(/\s+/g, ' ').substring(0, Math.min(30, node.getText().length)) + '...') : 'undefined'
export const dumpNodes = (nodes: ts.Node[]) => nodes.map(dumpNode).join('\n')
