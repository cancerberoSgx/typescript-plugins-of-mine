import { Project } from 'ts-morph'
import { getProperties } from '../src/declaration'


describe('declaration', () => {
  it('getProperties', () => {

    const p = new Project()
    const c = p.createSourceFile('s.ts', `
class A{m(o?: boolean){}}
class C extends A{hh(o: string[][], h=9){}; h=false}
const a = new C()
interface I {
  a:number[]
  b(a:number):string
}
let b:I&A
const c = {...{a: 1}, b: ['s']}
  `)

    expect(getProperties(c.getVariableDeclarationOrThrow('a').getType()).map(d => ({ name: d.name, type: d.type.getText(), callSignatures: d.callSignatures.map(s => s.parameters.map(p => p.name + ': ' + p.type.getText()).join(', ') + '): ' + s.returnType.getText()) }))).toEqual([
      {
        name: 'hh',
        type: '(o: string[][], h?: number) => void',
        callSignatures: ['o: string[][], h: number): void']
      },
      { name: 'h', type: 'boolean', callSignatures: [] },
      {
        name: 'm',
        type: '(o?: boolean) => void',
        callSignatures: ['o: boolean): void']
      }])

    expect(getProperties(c.getVariableDeclarationOrThrow('c').getType()).map(d => ({ name: d.name, type: d.type.getText(), callSignatures: d.callSignatures.map(s => s.parameters.map(p => p.name + ': ' + p.type.getText()).join(', ') + '): ' + s.returnType.getText()) }))).toEqual([
      { name: 'b', type: 'string[]', callSignatures: [] },
      { name: 'a', type: 'number', callSignatures: [] }
    ])
    expect(getProperties(c.getVariableDeclarationOrThrow('b').getType()).map(d => ({ name: d.name, type: d.type.getText(), callSignatures: d.callSignatures.map(s => s.parameters.map(p => p.name + ': ' + p.type.getText()).join(', ') + '): ' + s.returnType.getText()) }))).toEqual([
      { name: 'a', type: 'number[]', callSignatures: [] },
      {
        name: 'b',
        type: '(a: number) => string',
        callSignatures: ['a: number): string']
      },
      {
        name: 'm',
        type: '(o?: boolean) => void',
        callSignatures: ['o: boolean): void']
      }
    ])
  })
})

