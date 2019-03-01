import * as diff from 'diff';
import { SourceFile, TextChange, TextSpan } from 'typescript';
// import { TextSpan } from 'ts-simple-ast';

/** Taken from ts-simple-ast - TODO: it behaves differently than  ts.LanguageService's getCompletionEntryDetails or getEditsForRefactor - for it to work you will need to  `reverse()`  the edits*/
export function getTextFromFormattingEdits(sourceFile: SourceFile | string, textChanges: ReadonlyArray<TextChange>) {
  // reverse the order
  textChanges = [...textChanges].sort((a, b) => b.span.start - a.span.start);
  let text = typeof (sourceFile) === 'string' ? sourceFile : sourceFile.getFullText();

  for (const textChange of textChanges) {
    const span = textChange.span
    text = text.slice(0, span.start) + textChange.newText + text.slice(span.start + span.length);
  }

  return text;
}

/**
 * returns text changes that when applied to s1 will result in s2. IMPORTANT: for this to work with ts.LanguageService's getCompletionEntryDetails or getEditsForRefactor you will need to `reverse()` the returned array
 */
export function diffAndCreateTextChanges(s1: string, s2: string): TextChange[] {
  const result: TextChange[] = []

  diff.structuredPatch('f1', 'f2', s1, s2, '', '').hunks.map(hunk => {
    let index = 0

    hunk.lines.map(line => {
      const add = line.startsWith('+')
      const deletion = line.startsWith('-')
      const s = line.substring(1, line.length) + '\n'

      if (add) {
        result.push({ newText: s, span: { start: index, length: 0 } })
      }
      else if (deletion) {
        result.push({ newText: '', span: { start: index, length: s.length } })
        index += s.length
      }
      else {
        index += s.length
      }
    })
  })
  return result.reverse()
}

// /** returns TextSpan representing the addition of given string to given string in given position */
// export function insertTextSpan(text: string, pos: number, toInsert:string): TextSpan {
//   return {start: pos, length: toInsert.length}
// }

export function changeText(text: string, toInsert: {pos: number, toAdd?: string, toRemove?: string}[]): string{
  let s = text.split('')
  let indexIncr=0
  toInsert.forEach(data=>{
    data.toAdd = data.toAdd || ''
    data.toRemove = data.toRemove || ''
    s.splice(data.pos+indexIncr, data.toRemove.length, ...data.toAdd.split(''))
    indexIncr+=data.toAdd.length-data.toRemove.length
  })
  return s.join('')
}