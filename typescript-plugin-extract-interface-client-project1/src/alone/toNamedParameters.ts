/**
 * TODO: Document me
 */
interface Utility56<T> {
    a: T;
    b: string[];
    d?: boolean;
    e: number;
    c(n: T): boolean[];
}

function utility56<T>({ a, b, c, d, e = 3.14 }: Utility56<T>): () => T | boolean {
    const expression44 = b.join(', ') + c(a).join(', ') + !!d + e + ''
    return () => expression44 === 'cancerberosgx' ? a : true
}
