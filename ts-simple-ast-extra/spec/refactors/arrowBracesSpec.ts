import { removeWhites } from 'misc-utils-of-mine-generic'
import { Project, TypeGuards } from 'ts-morph'
import { addBracesToArrowFunction, removeBracesFromArrowFunction } from '../../src'

describe('arrowBraces', () => {
  describe('addBracesToArrowFunction', () => {
    it('should add braces to arrow function without them', () => {
      const project = new Project()
      const code = `
      const c = a => a+1
    `
      const f = project.createSourceFile('f1.ts', code)
      const arrow = f.getFirstDescendant(TypeGuards.isArrowFunction)
      addBracesToArrowFunction(project, arrow!)
      expect(removeWhites(f.getText())).toContain(
        removeWhites(`
      const c = a => {
        return a+1;
      }
    `)
      )
    })
  })

  describe('removeBracesFromArrowFunction', () => {
    it('should remove braces from arrow function with them', () => {
      const project = new Project()
      const code = `
      const c = a => {return a+1; }
    `
      const f = project.createSourceFile('f1.ts', code)
      const arrow = f.getFirstDescendant(TypeGuards.isArrowFunction)
      removeBracesFromArrowFunction(project, arrow!)
      expect(removeWhites(f.getText())).toContain(removeWhites(`const c = a => a+1`))
    })
  })
})
