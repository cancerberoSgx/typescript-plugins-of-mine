function foo32(n: number, date1: Date[][]): Promise<Boolean> { 
  return Promise.resolve(true)
}
function bar15(helpers: Interface17[] | undefined, air: Wind41, n: RegExp, 
  a: number[]): Promise<Boolean> { 
  return Promise.resolve(true)
}
interface Interface17 {
  method2: (b: Date[], a: number, c: boolean) =>  string // autocomplete needs to be INSIDE 
}
const obj45: Interface17 = {
  method2(b: Date[], a: number, c: boolean): string {
    return ''
  }
}
class Wind41 {
  blow(a: number, b: boolean[][], d: Date): number[] { 
    return []
  }
}
const result78 = new Wind41().blow(3.14, [[true]], new Date())