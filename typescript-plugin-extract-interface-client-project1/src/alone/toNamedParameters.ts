function utility56<T>(a: T, b: string[], c: (n: T) => boolean[], d?: boolean,
  e = 3.14): () => T | boolean {
  const expression44 = b.join(', ') + c(a).join(', ') + !!d + e + ''
  return () => expression44 === 'cancerberosgx' ? a : true
}
