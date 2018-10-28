import { SourceFile } from 'ts-simple-ast';

export function printSourceFile(sf: SourceFile) {
  return removeSpaces(sf.getText())
}
export function removeSpaces(s: string): string {
  return s.trim().replace(/[\s]+/gm, ' ')
}

export function sourceFileEquals(file: SourceFile, code: string) {
  expect(printSourceFile(file)).toBe(removeSpaces(code))
}