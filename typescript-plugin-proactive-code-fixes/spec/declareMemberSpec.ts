const code = `const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar123123(1, ['w'], true)  // <---- will add bar123123 as method of literal object o
interface Hello {}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])             // <----- will add world as method of interface Hello
const k = hello.mama(1, 2, 3) + ' how are you?'  // will add method mama to interface hello 
function f(h: Hello) {
  h.fromFunc = true                              // will add boolean property fromFunc to interface hello 
}
var x: Date = new Date(hello.timeWhen('born'))    // will add method timeWhen to interface Hello
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }  // will add method grasp to interface Hello
}
const notDefined:C
const a = notDefined.foof + 9                              // will add property foof to class C
`
import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('declareMember', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('add missing method to object literal', async () => {
    basicTest(70, config, 'declareMember', [`const o = { foo: () => { return 1 }, bar123123(arg0: number, arg1: string[], arg2: boolean): string[] { throw new Error('Not Implemented') }`])
  })
  it('add missing method to object\'s interface', async () => {
    basicTest(220, config, 'declareMember', [` interface Hello { world(arg0: number[][]): any; }`])
  })
  it('add missing method to object\'s interface 2', async () => {
    basicTest(329, config, 'declareMember', [`interface Hello { mama(arg0: number, arg1: number, arg2: number): string; }`])
  })
  // TODO: the rest of the cases
  afterEach(() => {
    defaultAfterEach(config)
  })
})
