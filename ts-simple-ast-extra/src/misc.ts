export function flat<T>(arr: T[][]): T[] {
  return arr.reduce((a, b) => a.concat(b))
}
export function flatReadOnly<T>(arr: ReadonlyArray<ReadonlyArray<T>>): ReadonlyArray<T> {
  return arr && arr.length ? arr.reduce((a, b) => a.concat(b)) : []
}
export function quote(s: string, q: string = '"'): string {
  return q + s.replace(new RegExp(q, 'g'), '\\' + q) + q
}

export function removeWhites(s: string, replaceWith = ' ') {
  return s.replace(/\s+/gm, replaceWith).trim()
}
