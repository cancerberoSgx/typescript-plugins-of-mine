import { createProject } from './testUtil';
import {getNodeLocalNamesNotReferencing, getNodeLocalNames, getNodeLocalsDeclarations} from '../src'
import { TypeGuards } from 'ts-morph';

describe('locals', ()=>{
  it('getNodeLocalNamesNotReferencing', ()=>{
    const { project, f1, f2 } = createProject(`
      export interface I {}
    `, `
      import { I } from "./f1"
      export const c: I = {}
    `)
      expect(getNodeLocalNamesNotReferencing(f2, f1.getInterfaceOrThrow('I'))).toEqual(['c'])
  })

  it('getNodeLocalsDeclarations', ()=>{
    const { project, f1, f2 } = createProject(`
      export interface I {
        m(): I
      }
    `, `
      import { I } from "./f1"
      export class A {
        constructor(a:Date){}
        m(i: I): I {var a = 1; throw 1}
      }
    `)
    
    expect(f2.getClass('A')!.getDescendants().filter(n=>TypeGuards.isMethodDeclaration(n)||TypeGuards.isConstructorDeclaration(n)||TypeGuards.isPropertyDeclaration(n)).map(n=>getNodeLocalNames(n))).toEqual([ [ 'a' ], [ 'i', 'a' ] ]);
    expect(f2.getClass('A')!.getDescendants().filter(n=>TypeGuards.isMethodDeclaration(n)||TypeGuards.isConstructorDeclaration(n)||TypeGuards.isPropertyDeclaration(n)).map(n=>getNodeLocalsDeclarations(n).map(d=>d!.getText()))).toEqual([ [ 'a:Date' ], [ 'i: I', 'a = 1' ]] )
  })
})