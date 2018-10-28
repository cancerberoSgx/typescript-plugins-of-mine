
const o = {
  foo: () => { return 1 },
  bar(arg0: number, arg1: string[], arg2: boolean): string[] {
    throw new Error('Not Implemented')
  }
}
const val: string[] = o.bar(1, ['w'], true)

interface Hello {
}
const hello: Hello = {
}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])
const k = hello.mama(1, 2, 3) + ' how are you?'
function f(h: Hello) {
  h.fromFunc = true
}
var x: Date = new Date(hello.timeWhen('born'))
class C {
  foof: number;
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }
}
const notDefined: C
const a = notDefined.foof + 9
