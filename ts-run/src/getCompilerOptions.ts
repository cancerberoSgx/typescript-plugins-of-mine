import { File } from './types'
import { CompilerOptions, ts } from 'ts-morph'
import { parseCompilerOptionsFromText } from 'ts-simple-ast-extra'
import { dirname } from 'misc-utils-of-mine-generic'

export async function getCompilerOptions(f: File) {
  const tsConfigData = await f.getContent()
  const tsconfigPath = dirname(f.getFilePath())
  const compilerOptions: CompilerOptions = parseCompilerOptionsFromText(tsConfigData, tsconfigPath)
  return compilerOptions
}
