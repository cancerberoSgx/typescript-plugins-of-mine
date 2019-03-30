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
    const { project, f1, f2 , f3} = createProject(`
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


})
