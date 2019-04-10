import { AstPath } from '.'
import {} from 'ts-morph'
import { getKindName } from '../types'

interface Options {
  /** will throw if path doesn't have syntax kind information */
  forceKindOrThrow?: boolean
  dontPrintSourceFilePrefix?: boolean
}
export function printAstPath(path: AstPath, options: Options = {}): string {
  if (options.forceKindOrThrow && !path.createOptions.includeNodeKind) {
    throw new Error('Ast path must be created with syntax kind information')
  }
  let s: string
  if (path.createOptions.includeNodeKind) {
    s = path.path.map((p, i) => `${getKindName(p.nodeKind!)}${i !== 0 ? `:nth-child(${p.index})` : ``}`).join('>')
  } else {
    s = path.path.map(p => `:nth-child(${p.index})`).join('>')
  }
  return options.dontPrintSourceFilePrefix && s.startsWith('SourceFile>') ? s.substring('SourceFile>'.length) : s
}

// export interface AstPathPrinter{
// print(path: AstPath): string
// }

// class TsQueryKindAndIndexAstPathPrinter implements AstPathPrinter {
//   print(path: AstPath): string{
//     if(!path.createOptions.includeNodeKind){
//       throw new Error('Ast path must be created with syntax kind information')
//     }
//     return path.path.map(p=>`${p.parentKind ? getKindName(p.parentKind!) : ''} > ${getKindName(p.nodeKind!)}:nth-child(${p.index})`).join(' > ')
//   }
// }
