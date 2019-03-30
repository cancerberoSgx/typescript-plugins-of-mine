import { removeWhites } from 'misc-utils-of-mine-generic';
import { moveDeclaration } from '../src/refactor/moveDeclaration';
import { createProject, expectNoErrors } from './testUtil';

describe('moveDeclaration', () => {

  it('basic case', () => {
    const { project, f1, f2 } = createProject(`
        class C {}
        export const c = new C()
      `, `
        export function f() { 
          const C = 1; 
          return C
        }
      `)
    moveDeclaration({
      declaration: f1.getClassOrThrow('C'), target: f2
    })
    expectNoErrors(project);
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
        import { C } from "./f2";
        export const c = new C()
      `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
        export class C {
        }
        export function f() { 
          const C = 1; 
          return C
        }
      `))
  })

  it('should rename if target already has a declaration with that name and export not', () => {
    const { project, f1, f2 } = createProject(`
        class C {}
        export const c = new C()
      `, `
        interface C{}
        export const t = 1
      `)
    moveDeclaration({
      declaration: f1.getClassOrThrow('C'), target: f2
    })
    expectNoErrors(project)
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
        import { C2 } from "./f2";
        export const c = new C2()
        
      `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
        export class C2 {
        }
        interface C{}
        export const t = 1
      `))
  })

  it('should remove target imports to declaration', () => {
    const { project, f1, f2 } = createProject(`
      export interface I {}
    `, `
      import { I } from "./f1"
      export const c: I = {}
    `)
    moveDeclaration({
      declaration: f1.getInterfaceOrThrow('I'), target: f2
    })
    expectNoErrors(project)
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
    `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
      export interface I {
      }
      export const c: I = {}
    `))
  })

  it('should import referenced types by node declaration in target sourcefile and make sure their declarations are exported if not', () => {
    const { project, f1, f2 } = createProject(`
      interface A {}
      export interface I {
        m(): A
      }
    `, `
      export const c = 1
    `)
    moveDeclaration({
      declaration: f1.getInterfaceOrThrow('I'), target: f2
    })
    expectNoErrors(project)
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
      export interface A {}
    `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
      import { A } from "./f1";
      export interface I {
          m(): A;
      }
      export const c = 1
    `))
  })

  it('should update other files import declarations', () => {
    const { project, f1, f2, f3 } = createProject(`
    interface A {}
    export interface I {
      m(): A
    }
  `, `
    export const c = 1
  `, `
  import { I } from './f1'
  export class C implements I {
    m() { return null as any }
  }
`)
    moveDeclaration({
      declaration: f1.getInterfaceOrThrow('I'), target: f2
    })
    // console.log(f1.getText(), f2.getText(), f3.getText());
    expectNoErrors(project)
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
    export interface A {}
  `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
    import { A } from "./f1";
    export interface I {
        m(): A;
    }
    export const c = 1
  `))
    expect(removeWhites(f3.getText())).toBe(removeWhites(`
    import { I } from "./f2";
    export class C implements I {
      m() { return null as any }
    }
  `))
  })

  it('should throw on default import and namespace import and files should not change', () => {
    const { project, f1, f2, f3 } = createProject(`
      export default interface I{}
    `, `
      import D from './f1'
      export default interface J{}
      `, `
      import * as f2 from './f2'
    `)
    expect(() =>
      moveDeclaration({
        declaration: f1.getInterfaceOrThrow('I'), target: f2
      })).toThrow()

    expect(() =>
      moveDeclaration({
        declaration: f2.getInterfaceOrThrow('J'), target: f3
      })).toThrow()
    // console.log(f1.getText(), f2.getText(), f3.getText());
    expectNoErrors(project)
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
      export default interface I{}
    `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
      import D from './f1'
      export default interface J{}
    `))
    expect(removeWhites(f3.getText())).toBe(removeWhites(`
      import * as f2 from './f2'
    `))
  })


  it('should support multiple chained calls and function , enum, class and interface nodes', () => {
    const { project, f1, f2, f3 } = createProject(`
      export interface I { }
      export enum E { a = 'a' }
      `, `
      import { I, E } from './f1'
      export class C { }
      export const a = 1
      export function f() { }
      `, `
      import { I } from './f1'
      import { C, a, f } from './f2'
      export type T = I | C | typeof a | typeof f
    `)
    moveDeclaration({
      declaration: f1.getEnumOrThrow('E'), target: f2
    })
    expectNoErrors(project)
    moveDeclaration({
      declaration: f2.getClassOrThrow('C'), target: f1
    })
    expectNoErrors(project)
    moveDeclaration({
      declaration: f2.getFunctionOrThrow('f'), target: f3
    })
    expectNoErrors(project)
    moveDeclaration({
      declaration: f3.getTypeAliasOrThrow('T'), target: f1
    })
    expectNoErrors(project)
    expect(removeWhites(f1.getText())).toBe(removeWhites(`
      import { a } from "./f2"; 
      import { f } from "./f3"; 
      export type T = I | C | typeof a | typeof f; 
      export class C { } 
      export interface I { }
    `))
    expect(removeWhites(f2.getText())).toBe(removeWhites(`
      export enum E {
        a = "a"
      }
      export const a = 1
    `))
    expect(removeWhites(f3.getText())).toBe(removeWhites(`
      export function f() {
      }
    `))
  })


  xit('should support variables and type alias', () => {
  })
  xit('should throw on unnamed node and files should not change', () => {
  })


})
