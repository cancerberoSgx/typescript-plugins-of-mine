import { detectNewline } from 'misc-utils-of-mine-generic'
import { RefactorFormatBaseOptions } from './format'

interface ConcreteEmptyLineOptions {
  /**
   * Maximum number of continuos empty lines allowed. 
   */
  emptyLinesMax?: number

  /**
   * Trim lines first in order to assert they are empty.
   */
  emptyLinesTrim?: boolean
}
export interface EmptyLinesOptions extends RefactorFormatBaseOptions, ConcreteEmptyLineOptions {

}
const defaultOptions: Required<ConcreteEmptyLineOptions> = {
  emptyLinesMax: 1,
  emptyLinesTrim: true
}

export function emptyLines(o: EmptyLinesOptions) {
  if (typeof o.emptyLinesMax === 'undefined') {
    return undefined
  }
  const s = o.file.getFullText()
  o = { ...defaultOptions, ...o }
  const a: string[] = []
  let n = 0
  s.split(detectNewline(s)).forEach(line => {
    const empty = line.trim() === ''
    if (empty) {
      n++
    } else {
      n = 0
    }
    if (!empty || n <= o.emptyLinesMax!) {
      a.push((empty && o.emptyLinesTrim) ? line.trim() : line)
    }
  })
  const r = a.join(o.newLineCharacter || '\n')
  o.file.replaceWithText(r)
  return r
}
