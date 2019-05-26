import { SourceFile, ts, TypeGuards } from 'ts-morph';
import { createTextChanges } from '..';
import { getFirstDescendant } from '../node';

export function removeTrailingSemicolons(f: SourceFile) {
  const changes: ts.TextChange[] = []
  f.getDescendantStatements().forEach(d => {
    const lt = d.getLastToken()
    if (lt && TypeGuards.isSemicolonToken(lt)) {
      const s = d.getNextSibling()
      const fd = s && getFirstDescendant(s)
      if (!fd || !['(', '['].includes(fd.getText().trim())) {
        changes.push({ span: { start: lt.getFullStart(), length: lt.getFullWidth() }, newText: '' })
      }
    }
  })
  f.applyTextChanges(createTextChanges(changes))
}
export function addTrailingSemicolons(f: SourceFile) {
  const changes: ts.TextChange[] = []
  f.getDescendantStatements().forEach(d => {
    const lt = d.getLastToken()
    if (lt && !TypeGuards.isSemicolonToken(lt) && !lt!.getText().trim().endsWith('}')) {
        changes.push({ span: { start: lt!.getEnd(), length: 0 }, newText: ';' })
    }
  })
  f.applyTextChanges(createTextChanges(changes))
}