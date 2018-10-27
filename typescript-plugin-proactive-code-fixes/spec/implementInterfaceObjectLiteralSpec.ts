const code = `
const tree1: Living = {
}
interface Living {
  name: string
  method1(foo: string): Date[]
}
const tree2: Living = {
  name: 'n',
  dddd: 'hshs',
  method1(foo: string): Date[] { return [new Date()] }; 
}


class Unit {
  energy: number
}
const unit: Unit = {
  energy: 123, 
  color: 'red'
}


  interface Beta {
    id: number
    canSwim: boolean
    method2: (a: string) => { created: Date, color: string }
  }
const beta1: Beta = {
  id: 1, 
  canSwim: true
}

interface SomeInterface2 {
  method3: (p: string) => Date
}
const obj: SomeInterface2 = {
  method3(p: string, b: boolean): Date {return new Date() }
}

`


import { basicTest, defaultAfterEach, defaultBeforeEach, DefaultBeforeEachResult } from './testUtil'

describe('implementInterfaceObjectLiteral', () => {
  let config: DefaultBeforeEachResult
  beforeEach(() => {
    config = defaultBeforeEach({ createNewFile: code })
  })
  it('adding missing signatures', async () => {
    basicTest(code.indexOf('tree1: ')+1, config, 'implementInterfaceObjectLiteral', [`const tree1: Living = { name: '', method1(foo: string): Date[] { throw new Error('Not Implemented'); } }`])
  })
  it('removing strange signatures when implementin interface', async () => {
    basicTest(code.indexOf('dddd: ')+1, config, 'implementInterfaceObjectLiteral', [`const tree2: Living = { name: 'n', method1(foo: string): Date[] { return [new Date()] }; }`])
  })
  it('removing strange signatures when type is class', async () => {
    basicTest(code.indexOf('color: ')+1, config, 'implementInterfaceObjectLiteral', [`const unit: Unit = { energy: 123 }`])
  }) 
  it('adding missing methods arrow', async () => {
    basicTest(code.indexOf('beta1: ')+1, config, 'implementInterfaceObjectLiteral', [`const beta1: Beta = { id: 1, method2(a: string): { created: Date; color: string; } { throw new Error('Not Implemented'); } }`])
  }) 
  xit('fixing methods when property is declared as prop no method - not working', async () => {
    basicTest(code.indexOf('method3(p: string, b: boolean)')+1, config, 'implementInterfaceObjectLiteral', [``])
  })
  
  afterEach(() => {
    defaultAfterEach(config)
  })
})
