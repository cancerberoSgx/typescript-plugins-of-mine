import { removeWhites } from 'misc-utils-of-mine-generic'
import { Project, TypeGuards } from 'ts-morph'
import {
  addBracesToArrowFunction,
  addBracesToArrowFunctions,
  removeBracesFromArrowFunction,
  removeBracesFromArrowFunctions
} from '../../src'

describe('arrowBraces', () => {
  describe('addBracesToArrowFunctions', () => {
    it('should add braces to arrow function without them', () => {
      const project = new Project()
      const code = `
        const c = a => a+1
      `
      const f = project.createSourceFile('f1.ts', code)
      const arrow = f.getFirstDescendant(TypeGuards.isArrowFunction)
      addBracesToArrowFunction(project, arrow!)
      expect(removeWhites(f.getText())).toBe(
        removeWhites(`
        const c = a => { 
          return a + 1; 
        }
    `)
      )
    })
    it('should add braces to all arrow functions descendants of given node', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'f1.ts',
        `
        const c = a => a+1
        export f = (b:number h: Date[])=>null
      `
      )
      addBracesToArrowFunctions(project, f)
      expect(removeWhites(f.getText())).toBe(
        removeWhites(`
          const c = a => { 
            return a + 1; 
          } 
          export f = (b:number h: Date[])=>{ 
            return null; 
          }
        `)
      )
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
        expect(removeWhites(f.getText())).toBe(removeWhites(`const c = a => a+1`))
      })
    })

    it('should remove braces from arrow all descendant arrow functions', () => {
      const project = new Project()
      const code = `
      const c = a => { return a+1; }
      export f = (a:number)=>{return a+1}
    `
      const f = project.createSourceFile('f1.ts', code)
      removeBracesFromArrowFunctions(project, f)
      expect(removeWhites(f.getText())).toBe(
        removeWhites(`
      const c = a => a+1
      export f = (a:number)=>a+1
      `)
      )
    })
  })
})
