import { SourceFile, TextChange } from 'typescript'

// taken from ts-simple-ast
export function getTextFromFormattingEdits(sourceFile: SourceFile | string, formattingEdits: ReadonlyArray<TextChange>) {
  // reverse the order
  formattingEdits = [...formattingEdits].sort((a, b) => b.span.start - a.span.start);
  let text = typeof (sourceFile) === 'string' ? sourceFile : sourceFile.getFullText();

  for (const textChange of formattingEdits) {
    const span = textChange.span
    text = text.slice(0, span.start) + textChange.newText + text.slice(span.start + span.length);
  }

  return text;
}

import * as diff from 'diff'
export function diffAndCreateTextChanges(s1: string, s2: string): TextChange[] {
  const result: TextChange[] = []

  // const patch = diff.structuredPatch('f1', 'f2', s1, s2, '', '')
  // console.log(patch);

  // console.log(diff.structuredPatch('f1', 'f2', s1, s2, '', ''));
  
  diff.structuredPatch('f1', 'f2', s1, s2, '', '').hunks.map(hunk => {
    let index = 0, firstTime=true
    // console.log(s1);
    
    hunk.lines.map(line => {
      const add = line.startsWith('+')
      const deletion = line.startsWith('-')
      const s = line.substring(1, line.length)+'\n'//w(add || deletion) ? (line.substring(1, line.length) + '\n') : (line + '\n')
      // console.log(line, line.length, index);
      
      if (add) {
        result.push({ newText: s, span: { start: index, length: 0 } })
        // index += 1//s.length 
      }
      else if (deletion) {
        result.push({ newText: '', span: { start: index, length: s.length } })
        index += s.length
      }
      else {
        index += s.length //+( firstTime ? 1 : 0)
      }
    })
    // console.log(d);

    // if(d.added) {
    //   result.push({newText: d.value, span: {start: index, length: 0}})
    //   index += d.count|1

    // }
    // else if(d.removed) {
    //   result.push({newText: '', span: {start: index, length: d.count|1}})
    //   index += d.count|1

    // }
    // else {

    //   index += d.count|1
    // }
  })
  return result.reverse()
}