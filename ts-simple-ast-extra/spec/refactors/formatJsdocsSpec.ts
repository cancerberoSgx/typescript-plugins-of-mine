import { Project } from 'ts-morph'
import { formatJsdocs } from '../../src/refactor/formatJsdocs'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('formatJsdocs', () => {
  it('should ff ', () => {
    const code = `
/**
 * dsd
 */
export const a = 1
/**
hjahsd
 */
export class C {
  /**
    fosd
 * @param {number} a foo bar
      @returns {number} jfjfjf
   */
  m(a:number) { return 1 }
}
export interface I {
  m(a:number): {
    o:string[]
    b: (g:{
  /** hello */
      p:boolean
      })=>void,
    uu: {
  /**
hello world
*/
      o:number
    }
  }
}
`
    const expected = `
/**
 * dsd
 */
export const a = 1
/**
 * hjahsd
 */
export class C {
  /**
   * fosd
   * @param {number} a foo bar
   * @returns {number} jfjfjf
   */
  m(a:number) { return 1 }
}
export interface I {
  m(a:number): {
    o:string[]
    b: (g:{
      /**
       * hello
       */
      p:boolean
      })=>void,
    uu: {
      /**
       * hello world
       */
      o:number
    }
  }
}`.trim()

    const project = new Project()
    const file = project.createSourceFile('test.ts', code)
    expectNoErrors(project)
    formatJsdocs({ project, file, formatJsdocs: true })
    expectNoErrors(project)
    expectEqualsAndDiff(file.getFullText().trim(), expected)
    //  expect(file.getText().trim()).toBe(expected)
    //  console.log(file.getFullText());

  })
})
