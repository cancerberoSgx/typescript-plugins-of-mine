function g34(): GResult {
  return { a: 1, b: 's' }
}

const h77 = <T>(): HResult<T> => {
  return { 
    a: 1, b: 's', 
    log: msg => msg + '', 
    kill: function (probe: T) { return 1 }, 
    status: { t: new Date() } 
  }
}

function fn87<T>(): FNResult<T> {
  return {
    a: 1,
    b: 's',
    log: (msg: string = 'hello') => { },
    kill: function <T>(foo: HResult<T>, value: T): { amount: number, newValue: T } {
      return {
        amount: 1, newValue: null
      }
    }
  }
}
