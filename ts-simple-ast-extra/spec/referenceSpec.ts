import { notSame } from 'misc-utils-of-mine-generic'
import { getTypeReferencesByDefinitionOrigin, Project } from '../src'
import { expectNoErrors } from './testUtil'

describe('types', () => {
  it('getTypeReferencesByDefinitionOrigin', () => {
    var p = new Project()
    const a = p.createSourceFile('a.ts', `
import {B} from './b'
export type A = B & {a: string}
import {C2} from './b'
export type C1 = A | string
var a: A, b:B, c1: C1, c2: C2`)

    const b = p.createSourceFile('b.ts', `
export type B = {b: string}
import {A} from './a' 
export type C2 = B | string
var a: A, b:B, c2: C2
`)
    expectNoErrors(p)

    expect(getTypeReferencesByDefinitionOrigin({ node: a, origin: 'internal' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['A', 'C1'])
    expect(getTypeReferencesByDefinitionOrigin({ node: a, origin: 'external' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['B', 'C2'])
    expect(getTypeReferencesByDefinitionOrigin({ node: a, origin: 'any' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['A', 'B', 'C1', 'C2'])
    expect(getTypeReferencesByDefinitionOrigin({ node: a, origin: 'unknown' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual([])

    const c = p.createSourceFile('c.ts', `
export type B = {b: string}
import {G} from './g' 
import {A} from './a' 
var   b:B, g:G, x: X, a: A
`)

    expect(getTypeReferencesByDefinitionOrigin({ node: c, origin: 'any' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['A', 'B', 'G', 'X'])
    expect(getTypeReferencesByDefinitionOrigin({ node: c, origin: 'internal' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['B', 'G'])
    expect(getTypeReferencesByDefinitionOrigin({ node: c, origin: 'external' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['A', 'X'])
    expect(getTypeReferencesByDefinitionOrigin({ node: c, origin: 'unknown' }).map(n => n.getTypeName().getText()).filter(notSame).sort()).toEqual(['X',])

  })
})
