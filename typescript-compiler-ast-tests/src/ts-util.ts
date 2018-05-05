
import ts from 'typescript';
import { Node } from 'typescript';
import { readFileSync, existsSync } from 'fs';
import { sep, dirname, basename } from 'path';

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


export function dumpAst(ast: ts.SourceFile) {
  function visit(node: Node, visitor: (node: Node, index?: number, level?: number) => void, index: number = 0, level: number = 0) {
    if (!node) {
      return
    }
    visitor(node, index, level);
    let i = 0
    node.forEachChild(child => visit(child, visitor, i++, level + 1))
  }
  function print(node: Node, index: number = 0, level: number = 0) {
    const indent = new Array(level).map(i => '').join('  ')
    buffer.push(`${indent} ${index} ${getKindName(node.kind)}`)
  }
  const buffer: Array<string> = []
  visit(ast, print)
  return buffer.join('\n')
}


export function compileFile(sourcefile: string, tsconfigPath: string = './src/assets/simpletsconfig.json'): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath).toString())

  let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, dirname(tsconfigPath))
  if (errors.length) {
    throw errors
  }
  const compilerHost = ts.createCompilerHost(options)
  return ts.createProgram([sourcefile], options, compilerHost);
}


export function compileProject(projectFolder: string, rootFiles: Array<string> = [], tsconfigPath: string = projectFolder + sep + 'tsconfig.json'): ts.Program {
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
    // getSourceFile: (fileName, languageVersion) => {
    //   if (existsSync(fileName)) {
    //     return ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
    //   }
    // }
  }
  return ts.createProgram(rootFiles, compilerOptions.options, compilerHost);
}

