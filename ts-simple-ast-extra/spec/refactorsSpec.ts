import Project, { SourceFile, NamedNode, ArrowFunction, Node, TypeGuards } from 'ts-simple-ast';
import { applyTextChanges, createTextChanges } from '../src';
import { moveToNewFile, addBracesToArrowFunction, removeBracesFromArrowFunction, convertToEs6Module, fixUnusedIdentifiers } from '../src/refactors';

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


  it('convertToEs6Module', ()=>{
    const project = new Project()
    const code = `
    const r = require('f')
    const f = foo('r')
    import {foo} from 'bar'
    `
    const f = project.createSourceFile('f1.ts', code)
    
    convertToEs6Module(project, f)
    
    expect(f.getText()).toContain('import r from \'f\';')
    
  })
  
  
xit('fixUnusedIdentifiers', ()=>{ // it doesn't work
    const project = new Project()
    const code = `
    const r = require('f')
    export function f(){}
    function foo(){}
    foo()
    function unu(){}
    const a = 1
    `
    const f = project.createSourceFile('f1.ts', code)
    project.createSourceFile('f2.ts',`import {f} from './f1';f()`)
    fixUnusedIdentifiers(project, f)//, f.getFunction('foo'))
    
    console.log(f.getText());
    // expect(f.getText()).toContain('import r from \'f\';')
  
    })

    
})

// const r = require('f')