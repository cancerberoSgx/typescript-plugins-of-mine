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
  blow(d: Date, b: boolean[][], a: number): number[] { 
  /* &%&% reorderParams("blow", [2, 1, 0]) */
  
    return []
  }
}
const result78 = new Wind41().blow(new Date(), [[true]], 3.14)