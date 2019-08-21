import { getExtendsRecursively, getImplementsAll, getImplementsAllNames } from '../src'
import { getFile } from './testUtil'

describe('types', () => {
  const code1 = `
interface I{}
interface I1 extends I{}
interface I2<T> extends I1{}
interface J{}
interface I3<T> extends I2<T>, J{} 
class A implements I{}
class B extends A implements J{}
class C<T> extends B implements I2<T>{}
class D<T> extends C<T> implements I3{} 
var x = new A()
`

  it('getExtendsRecursively', () => {
    const f = getFile(code1)
    expect(getExtendsRecursively(f.getClass('D')!).map(n => n.getExpression().getText())).toEqual(['C', 'B', 'A'])
    expect(getExtendsRecursively(f.getInterface('I3')!).map(n => n.getExpression().getText())).toEqual([
      'I2',
      'J',
      'I1',
      'I'
    ])
  })

  it('getExtendsRecursively', () => {
    const f = getFile(code1)
    expect(getImplementsAll(f.getClass('A')!).map(n => n.getExpression().getText())).toEqual(['I'])
    expect(getImplementsAll(f.getClass('B')!).map(n => n.getExpression().getText())).toEqual(['J', 'I'])
    expect(getImplementsAllNames(f.getClass('C')!)).toEqual(['I2', 'I1', 'I', 'J'])
    expect(getImplementsAllNames(f.getClass('D')!)).toEqual(['I3', 'I2', 'I1', 'I', 'J'])
  })
})
