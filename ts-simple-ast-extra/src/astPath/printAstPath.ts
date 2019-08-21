import { } from 'ts-morph'
import { AstPath } from '.'
import { getKindName } from '../types'

interface Options {
  /** will throw if path doesn't have syntax kind information */
  forceKindOrThrow?: boolean
  dontPrintSourceFilePrefix?: boolean
  onlyIndex?: boolean
  onlyKindName?: boolean
  onlyNameOrKind?: boolean
  levelSeparator?: string
}

export function printAstPath(path: AstPath, options: Options = {}): string {
  if (options.forceKindOrThrow && !path.createOptions.includeNodeKind) {
    throw new Error('Ast path must be created with syntax kind information')
  }
  let s: string

  if (path.createOptions.includeNodeName && options.onlyNameOrKind) {
    s = path.path.map(p => `${p.nodeName}`).join(options.levelSeparator || '>')
  } else if (path.createOptions.includeNodeKind && options.onlyKindName) {
    s = path.path.map(p => `${getKindName(p.nodeKind!)}`).join(options.levelSeparator || '>')
  } else if (options.onlyIndex) {
    s = path.path.map(p => `${p.index}`).join(options.levelSeparator || '>')
  } else {
    if (path.createOptions.includeNodeKind) {
      s = path.path
        .map((p, i) => `${getKindName(p.nodeKind!)}${i !== 0 ? `:nth-child(${p.index})` : ``}`)
        .join(options.levelSeparator || '>')
    } else {
      s = path.path.map(p => `:nth-child(${p.index})`).join(options.levelSeparator || '>')
    }
  }
  return options.dontPrintSourceFilePrefix && s.startsWith('SourceFile>') ? s.substring('SourceFile>'.length) : s
}
