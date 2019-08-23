import { RefactorInputOptions } from './format'

interface ConcreteEmptyLineOptions {
  emptyLinesMax?: number
  emptyLinesTrim?: boolean
  emptyLinesNewLineChar?: string
}
export interface EmptyLinesOptions extends RefactorInputOptions, ConcreteEmptyLineOptions {

}
const defaultOptions: Required<ConcreteEmptyLineOptions> = {
  emptyLinesMax: 1,
  emptyLinesNewLineChar: '\n',
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
  s.split(o.emptyLinesNewLineChar!).forEach(line => {
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
  const r = a.join(o.emptyLinesNewLineChar!)
  o.file.replaceWithText(r)
  return r
}
