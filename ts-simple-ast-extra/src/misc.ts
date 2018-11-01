
export function flat<T>(arr: T[][]): T[] {
  return arr.reduce((a, b) => a.concat(b))
}