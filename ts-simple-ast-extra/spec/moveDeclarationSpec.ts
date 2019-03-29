import { removeWhites } from 'misc-utils-of-mine-generic';
import { Project, SourceFile, ts } from 'ts-morph';
import { moveDeclaration } from '../src/refactor/moveDeclaration';
import { getLocals, getNodeLocalsNotReferencing, getNodeLocalNamesNotReferencing } from '../src/reference';

function createProject(...args: string[]) {
  const project = new Project()
  const f1 = project.createSourceFile('f1.ts', args[0] || '')
  const f2 = project.createSourceFile('f2.ts', args[1] || '')
  const f3 = project.createSourceFile('f3.ts', args[2] || '')
  expectNoErrors(project)
  return { project, f1, f2, f3 }
}

describe('moveDeclaration', () => {
  describe('locals1', ()=>{
    it('test', ()=>{
      const { project, f1, f2 } = createProject(`
        export interface I {}
      `, `
        import { I } from "./f1"
        export const c: I = {}
      `)
      // const entries = getLocals(f1);
      // console.log(entries.filter(e=>e.valueDeclaration).map(e=>e.valueDeclaration.getText()))
      // console.log(getNodeLocalsNotReferencing(f1, f1.getClassOrThrow('C')))
      // console.log(getNodeLocalNamesNotReferencing(f2, f1.getInterfaceOrThrow('I')))
     
     

    })
  })
  describe('should make it exported', () => {

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
    // console.log(f1.getClassOrThrow('C').findReferencesAsNodes().map(r=>r.getSourceFile().getFilePath()));
    moveDeclaration({
      declaration: f1.getInterfaceOrThrow('I'), target: f2
    })
    // console.log(f1.getText(), ' \n\n', f2.getText());
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
})


function expectNoErrors(project: Project) {
  expect(project.getPreEmitDiagnostics().map(d => d.getMessageText()).join(', ')).toBe('');
}
