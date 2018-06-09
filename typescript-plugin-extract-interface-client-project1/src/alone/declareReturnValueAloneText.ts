interface GResult {
    a: number;
    b: string;
}

function g34(): GResult {
    return { a: 1, b: 's' }
}

interface HResult<T> {
    a: number;
    b: string;
    status: { t: Date; };
    log(msg: any): string;
    kill(probe: T): number;
}

const h77 = <T>(): HResult<T> => {
    return {
        a: 1, b: 's',
        log: msg => msg + '',
        kill: function(probe: T) { return 1 },
        status: { t: new Date() }
    }
}

interface FNResult<T> {
    a: number;
    b: string;
    log(msg?: string): void;
    kill<T>(foo: HResult<string>, value: T): { amount: number; newValue: T; };
}

function fn87<T>(): FNResult<T> {
    return {
        a: 1,
        b: 's',
        log: (msg: string = 'hello') => { },
        kill: function <T>(foo: HResult<string>, value: T): { amount: number, newValue: T } {
            return {
                amount: 1, newValue: null
            }
        }
    }
}
