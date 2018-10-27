const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar123123(1, ['w'], true)  // <---- will add bar123123 as method of literal object o

interface FNResult<T> {
}


function fn<T>(): FNResult<T> {
 
}


const variableString1 = 'hello world1'
const variableString2 = "hello world2"