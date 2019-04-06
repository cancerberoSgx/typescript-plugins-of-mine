import { removeWhites } from 'misc-utils-of-mine-generic';
import { Identifier, Project, TypeGuards } from 'ts-morph';
import { declareVariable, declareVariables } from '../../src';

describe('declareVariable', () => {
  describe('declareVariable', () => {
    it('should declare a function if a call expression references one not defined. ', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'test.ts',
        `const a = nonDeclared(2,'s')`
      )
      declareVariable(f.getDescendants().find(d=>TypeGuards.isIdentifier(d) &&d.getText()==='nonDeclared' )! as Identifier, project.getTypeChecker(), f.getPreEmitDiagnostics())
      expect(removeWhites(f.getText())).toBe(
        removeWhites(
          `
          function nonDeclared(arg0: number, arg1: string): any {
            throw new Error('Not Implemented');
          }
          const a = nonDeclared(2,'s')
        `
        )
      )
    })
    it('should declare a add let to a non declared variable assignation', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'test.ts',
        `a = [1,2]`
      )
      declareVariable(f.getDescendants().find(d=>TypeGuards.isIdentifier(d) &&d.getText()==='a' )! as Identifier, project.getTypeChecker(), f.getPreEmitDiagnostics())
      expect(removeWhites(f.getText())).toBe(
        removeWhites(
          `
          let a = [1,2]
        `
        )
      )
    })
  })
  describe('declareVariables', () => {
    it('should declare a functions and variables missing in a file', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'test.ts',
        `
        a = 'foo'
        export const g = nonDecl('foo')
        `
      )
      declareVariables(f, project.getTypeChecker(), f.getPreEmitDiagnostics())
      expect(removeWhites(f.getText())).toBe(
        removeWhites(
          `
          let a = 'foo'
          function nonDecl(arg0: string): any {
            throw new Error('Not Implemented');
          }
          export const g = nonDecl('foo')
        `
        )
      )
    })
  })
})
