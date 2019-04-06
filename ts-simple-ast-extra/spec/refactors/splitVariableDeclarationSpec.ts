import { Project, SyntaxKind } from 'ts-morph'
import { splitVariableDeclaration, splitVariableDeclarations } from '../../src'
import { removeWhites } from 'misc-utils-of-mine-generic'
describe('splitVariableDeclaration', () => {
  describe('splitVariableDeclaration', () => {
    it('should split a variable declaration list into several statements and add types if list variables dont declare any', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'test.ts',
        `
        var a = 1, b = '', c, d: Date[][] = []
      `
      )
      splitVariableDeclaration(f.getFirstDescendantByKind(SyntaxKind.VariableDeclarationList)!)
      expect(removeWhites(f.getText())).toBe(
        removeWhites(
          `
        var a: number = 1;
        var b: string = '';
        var c: any;
        var d: Date[][] = [];
        `
        )
      )
    })
  })

  describe('splitVariableDeclarations', () => {
    it('should split all variable declaration lists found on given node descendants into several statements and add types if list variables dont declare any', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'test.ts',
        `
        var a = 1, b = '', c, d: Date[][] = []
        function f(){
          const c = 1, d = 'sad', f = [new Date()], g = !!a
        }
      `
      )
      splitVariableDeclarations(f)
      expect(removeWhites(f.getText())).toBe(
        removeWhites(
          `
        var a: number = 1;
        var b: string = '';
        var c: any;
        var d: Date[][] = [];
        function f(){
            const c: 1 = 1;
            const d: "sad" = 'sad';
            const f: Date[] = [new Date()];
            const g: boolean = !!a;
        }
        `
        )
      )
    })
  })
})
