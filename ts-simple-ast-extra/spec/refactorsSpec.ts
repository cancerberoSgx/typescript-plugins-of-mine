import Project, { SourceFile, NamedNode, ArrowFunction, Node, TypeGuards } from 'ts-simple-ast';
import { applyTextChanges, createTextChanges } from '../src';
import { moveToNewFile, addBracesToArrowFunction, removeBracesFromArrowFunction } from '../src/refactors';

describe('fileSpec', ()=>{
  it('moveToNewFile refactor', ()=>{
    const project = new Project()
    const code = `
export class Class1 {}
const c = new Class1()
`
    const f = project.createSourceFile('f1.ts', code)
    
  moveToNewFile(project,  f.getClass('Class1'))
  expect(f.getText()).not.toContain('class Class1')
  expect(f.getText()).toContain('import { Class1 } from "./Class1";')
  const newFile = project.getSourceFile('Class1.ts')
  expect (newFile.getText()).toContain('export class Class1')
  
  })

  it('addBracesToArrowFunction', ()=>{
    const project = new Project()
    const code = `
const c = a => a+1
`
    const f = project.createSourceFile('f1.ts', code)
    const arrow = f.getFirstDescendant(TypeGuards.isArrowFunction)
    addBracesToArrowFunction(project, arrow)

    expect(f.getText()).toContain(`const c = a => {
return a+1;
}`)
})
    

it('addBracesToArrowFunction', ()=>{
  const project = new Project()
  const code = `
const c = a => {return a + 1; }
`
  const f = project.createSourceFile('f1.ts', code)
  const arrow = f.getFirstDescendant(TypeGuards.isArrowFunction)
  removeBracesFromArrowFunction(project, arrow)
  
  expect(f.getText()).toContain(`const c = a => a+1`)

  })
})

