import { Project, SyntaxKind } from 'ts-morph'
import { splitVariableDeclaration } from '../../src'
import { removeWhites } from 'misc-utils-of-mine-generic'

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
