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

    it('should rename if target already has a declaration with that name', () => {
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

    // xit('should export if its not', () => {

    // })

    // xit('should import referenced types by node declaration in target sourcefile ', () => {

    // })

})
