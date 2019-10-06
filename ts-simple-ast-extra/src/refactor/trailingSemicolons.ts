import { SourceFile, ts, TypeGuards } from 'ts-morph'
import { createTextChanges } from '..'
import { getFirstDescendant, getLastToken } from '../node'
import { RefactorFormatBaseOptions } from './format'

export interface TrailingSemicolonsOptions extends RefactorFormatBaseOptions {
  trailingSemicolons?: 'never' | 'always'
}

export function trailingSemicolons(options: TrailingSemicolonsOptions) {
  if (!options.trailingSemicolons) {
    return
  }
  if (options.trailingSemicolons === 'never') {
    removeTrailingSemicolons(options.file)
  } else if (options.trailingSemicolons === 'always') {
    addTrailingSemicolons(options.file)
  }
}

export function removeTrailingSemicolons(f: SourceFile) {
  const changes: ts.TextChange[] = []
  f.getDescendantStatements().forEach(d => {
    const lt = getLastToken(d)
    if (lt && TypeGuards.isSemicolonToken(lt)) {
      const s = d.getNextSibling()
      const fd = s && getFirstDescendant(s)
      // if next sibling exists and doesn't start with ( or [ and is not in the same line then we can remove the semi colon
      if (!fd || (fd.getStartLineNumber() > d.getStartLineNumber() && !['(', '['].includes(fd.getText().trim()))) {
        changes.push({ span: { start: lt.getFullStart(), length: lt.getFullWidth() }, newText: '' })
      }
    }
  })
  f.applyTextChanges(createTextChanges(changes))
}

export function addTrailingSemicolons(f: SourceFile) {
  const changes: ts.TextChange[] = []
  f.getDescendants().forEach(d => {
    if (!TypeGuards.isStatement(d)) {
      return
    }
    const lt = d.getLastToken()
    if (!lt) {
      return
    }
    else if (TypeGuards.isSemicolonToken(lt)) {
      // add semicolon only if there is not already one
      return
    }
    else if (lt.getText().trim().endsWith('}')) {
      // is block-like declaration - then it doesn't need
      return
    }
    changes.push({ span: { start: lt!.getEnd(), length: 0 }, newText: ';' })
  })
  f.applyTextChanges(createTextChanges(changes))
}
