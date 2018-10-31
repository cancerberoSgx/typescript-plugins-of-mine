import { applyTextChanges } from 'ts-simple-ast-extra';
import { addType } from '../src/code-fix/addType';
import { testCodeFixRefactorEditInfo } from './testUtil';
describe('addType', () => {

  it('should add types on identifiers which parents are variables or functions or method declarations without explicit type or return type', () => {

    const code = `
var asdfsdf = 1

function ff() {
  return 'a'
}

class A {
  m1(foo) { return ''+foo }

  prop1 = new A()
}
function gg() { return new A() }

const cc = gg()

const fff = foo => { return new A().m1(foo) }

function f2(paramWithoutType = 1){return paramWithoutType + 1}

function f3(paramWithoutType2){return paramWithoutType2+1}
f3(2)
`
function test(indexOf, toContain){
  const result = testCodeFixRefactorEditInfo(code, indexOf, addType.name)
  const output = applyTextChanges(code, result.edits[0].textChanges )
  expect(output).toContain(toContain)
}

    test(code.indexOf('asdfsdf'),'var asdfsdf: number = 1')

    test(code.indexOf('ff()'),'function ff(): string')

    test(code.indexOf('m1(foo'),'m1(foo): string {')
    test(code.indexOf('prop1 = '),'prop1: A = ')

    test(code.indexOf('gg()'),'g(): A')
    test(code.indexOf('cc = gg()'),'const cc: A = gg()')

    test(code.indexOf('fff = foo =>'),'fff: (foo: any) => string = foo =>' )

    test(code.indexOf('paramWithoutType'),'function f2(paramWithoutType: number = 1)' )
    test(code.indexOf('paramWithoutType2'),'function f3(paramWithoutType2: any)' )

  })

  xit('should not be suggested if cursor is not on an identifier or if the parent already has a type declared', ()=>{

  })
})

