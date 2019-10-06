import { Project } from 'ts-morph'
import { convertParamsToDestructuredObject } from '../../src'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('convertParamsToDestructuredObject', () => {
  it('should convert a function declaration\'s parameters', () => {
    const code = `
function f(a: number, b: string[]) { }; 
export const a = f(1, ['1']);
    `.trim()
    const expected = `
function f({ a, b }: { a: number; b: string[]; }) { }; 
export const a = f({ a: 1, b: ['1'] });
`.trim()
    const project = new Project()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    convertParamsToDestructuredObject({ file, project, node: file.getFunctionOrThrow(('f')) })
    expectEqualsAndDiff(file.getFullText().trim(), expected)
    expectNoErrors(project)
  })

  it('should not convert class\' methods overriding', () => {
    const code = `
interface I {
    m(a: Date[], b: boolean, c?: string, d?: number[][]): void
}
class C implements I {
    m(a: Date[], b: boolean, c?: string, d?: number[][]) { }
    n(a: Date[], b: boolean, c?: string, d?: number[][]) { }
}`
    const expected = `
interface I {
    m(a: Date[], b: boolean, c?: string, d?: number[][]): void
}
class C implements I {
    m(a: Date[], b: boolean, c?: string, d?: number[][]) { }
    n({ a, b, c, d }: { a: Date[]; b: boolean; c?: string; d?: number[][]; }) { }
}`.trim()
    const project = new Project()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    file.getClassOrThrow('C').getMethods().forEach(node => convertParamsToDestructuredObject({ file, project, node }))
    expectEqualsAndDiff(file.getFullText().trim(), expected)
    expectNoErrors(project)

  })

  it('should refactor all files', () => {
    const project = new Project()
    const file = project.createSourceFile('f.ts', 'export function f(a: number, b: string[]) { }')
    const file2 = project.createSourceFile('a.ts', `import {f} from './f'; f(1, ["b"]);`)
    expectNoErrors(project)
    convertParamsToDestructuredObject({ file, project, node: file.getFunctionOrThrow('f') })
    expect(file.getText()).toEqual(`export function f({ a, b }: { a: number; b: string[]; }) { }`)
    expect(file2.getText()).toEqual(`import {f} from './f'; f({ a: 1, b: ["b"] });`)
  })
})
