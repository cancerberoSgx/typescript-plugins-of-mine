export function notUndefined<T>(a: T): a is Exclude<T, undefined> {
  return typeof a !== 'undefined'
}
type falsy = undefined | null | false | '' | 0

/** Removes undefined from type.  Example `Falsy<number|boolean>` will be `number|true` */
export type NotFalsy<T> = Exclude<T, falsy>
// let c: NotFalsy<number|boolean>

/** Useful for filtering out falsy values without casting. */
export function notFalsy<T>(n: T): n is NotFalsy<T> {
  return !!n
}
