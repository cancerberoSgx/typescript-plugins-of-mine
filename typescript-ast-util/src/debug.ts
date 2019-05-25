import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as ts from 'typescript';
import { getKindName, visitChildrenRecursiveDeepFirst } from '.';
import { compileFile } from './compiler';

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

export function compileSource(sourceCode: string, tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): { program: ts.Program, fileName: string, tsconfigPath: string } {
  const fileName = tmpdir() + '/' + 'tmpFile_' + Date.now() + '.ts'
  writeFileSync(fileName, sourceCode)
  return { 
    program: compileFile(fileName, tsconfigPath), 
    fileName, 
    tsconfigPath 
  }
}

export const dumpNode = (node: ts.Node) => node ? (getKindName(node) + ', starts: ' + node.getFullStart() + ', width: ' + node.getFullWidth() + ', ' + node.getText().replace(/\s+/g, ' ').substring(0, Math.min(30, node.getText().length)) + '...') : 'undefined'
export const dumpNodes = (nodes: ts.Node[]) => nodes.map(dumpNode).join('\n')
