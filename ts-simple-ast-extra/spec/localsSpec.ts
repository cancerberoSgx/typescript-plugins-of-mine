import { createProject } from './testUtil'
import { getNodeLocalNamesNotReferencing, getNodeLocalNames, getNodeLocalsDeclarations, isDeclaration } from '../src'
import { TypeGuards, createWrappedNode } from 'ts-morph'

describe('locals', () => {
  it('getNodeLocalNamesNotReferencing', () => {
    const { project, f1, f2 } = createProject(
      `
      export interface I {}
    `,
      `
      import { I } from "./f1"
      export const c: I = {}
    `
    )
    expect(getNodeLocalNamesNotReferencing(f2, f1.getInterfaceOrThrow('I'))).toEqual(['c'])
  })

  it('getNodeLocalsDeclarations', () => {
    const { project, f1, f2 } = createProject(
      `
      export interface I {
        m(): I
      }
    `,
      `
      import { I } from "./f1"
      export class A {
        constructor(a:Date){}
        m(i: I): I {var a = 1; throw 1}
      }
    `
    )

    expect(
      f2
        .getClass('A')!
        .getDescendants()
        .filter(
          n =>
            TypeGuards.isMethodDeclaration(n) ||
            TypeGuards.isConstructorDeclaration(n) ||
            TypeGuards.isPropertyDeclaration(n)
        )
        .map(n => getNodeLocalNames(n))
    ).toEqual([['a'], ['i', 'a']])

    expect(
      f2
        .getClass('A')!
        .getDescendants()
        .filter(
          n =>
            TypeGuards.isMethodDeclaration(n) ||
            TypeGuards.isConstructorDeclaration(n) ||
            TypeGuards.isPropertyDeclaration(n)
        )
        .map(n => getNodeLocalsDeclarations(n).map(d => d!.getText()))
    ).toEqual([['a:Date'], ['i: I', 'a = 1']])

    expect(
      f2
        .getClass('A')!
        .getDescendants()
        .filter(isDeclaration)
        .map(n => getNodeLocalsDeclarations(n).map(d => d!.getText()))
    ).toEqual([['a:Date'], [], ['i: I', 'a = 1'], [], [], []])
    // const r = f2.getClass('A')!.getDescendants().filter(isDeclaration).map(n=>getNodeLocalsDeclarations(n)).flat().filter(notFalsy)
    // console.log(r.map(r=>r.getText()));

    // console.log(f2.getClass('A')!.getDescendants().filter(isDeclaration).map(n=>getNodeLocalsDeclarations(n).map(d=>d!.getText())))
  })

  // it('getReferencesIn', ()=>{
  //   const { project, f1, f2 } = createProject(`
  //   export interface I {
  //     m(): I
  //   }
  // `, `
  //   import { I } from "./f1"
  //   export class A {
  //     constructor(a:Date){}
  //     m(i: I): I {var a = 1; throw 1}
  //   }
  //   export interface I2 {
  //     m(): I
  //     m2(): A
  //   }
  // `)

  // ts.isTypeReferenceNode
  // console.log(  getReferencesIn(f2.getInterface('I2')!).map(r=>r.getText()))
  // console.log(  getReferencesIn(f2.getClass('A')!).map(r=>r.getText()))

  //   getReferencesIn(f2.getClass('A')!).map(r=>r.forEachChild(c=>{
  //   const n = createWrappedNode(c)
  //   console.log(n.getKindName());

  //   if(TypeGuards.isTypeReferenceNode(n)){
  //     // n.dec
  //   }
  // })
  // ))
  // ts.refer
  // getReferencesIn(f2).map(a=>a.getText())
  // expect(getReferencesIn(f2.getClass('A')!).map(r=>r.getText())).toEqual([ 'a:Date', 'i: I', 'a = 1' ])
  // })
})
