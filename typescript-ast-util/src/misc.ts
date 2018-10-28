
export function unionEquals<T>(left: T[], right: T[], equals: (a: T, b: T) => boolean): T[] {
  return left.concat(right).reduce((acc, element) => {
    return acc.some(elt => equals(elt, element)) ? acc : acc.concat(element)
  }
    , []);
}

export function flat<T>(arr: T[][]): T[] {
  return arr.reduce((a, b) => a.concat(b))
}