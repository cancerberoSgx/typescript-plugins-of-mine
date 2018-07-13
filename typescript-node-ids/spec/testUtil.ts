import * as ts from 'typescript'
// import { getKindName } from '../src/util';
import { getId } from '../src';
import { getKindName } from 'typescript-ast-util';



export function printNode (n: ts.Node, level: number = 0, index: number, parentNode: ts.Node):string {
  const text = n.getText()//.replace(/[\\n\\s]+/gm, ' ')
  return`${new Array(level * 2).fill(' ').join('')}${getKindName(n.kind)}" - id: ${getId(n)} ${text.substring(0, Math.min(text.length, 20))}`
}

// /** creates a dummy ts.Program in memory with given source files inside */
// export function createProgram(files: {
//   fileName: string, content: string,
//   sourceFile?: ts.SourceFile
// }[], compilerOptions?: ts.CompilerOptions): ts.Program {
//   const tsConfigJson = ts.parseConfigFileTextToJson('tsconfig.json',
//     compilerOptions ? JSON.stringify(compilerOptions) : `{
//     "compilerOptions": {
//       "target": "es2018",   
//       "module": "commonjs", 
//       "lib": ["es2018"],
//       "rootDir": ".",
//       "strict": false,   
//       "esModuleInterop": true,
//     }
//   `)
//   let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, '.')
//   if (errors.length) {
//     throw errors
//   }
//   const compilerHost = ts.createCompilerHost(options)
//   compilerHost.getSourceFile = function (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile | undefined {
//     const file = files.find(f => f.fileName === fileName)
//     if (!file) return undefined
//     file.sourceFile = file.sourceFile || ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES2015, true)
//     return file.sourceFile
//   }
//   return ts.createProgram(files.map(f => f.fileName), options, compilerHost)
// }

