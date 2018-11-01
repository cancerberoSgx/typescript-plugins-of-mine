import Project, { TypeGuards } from 'ts-simple-ast';
import { addBracesToArrowFunction, convertToEs6Module, moveToNewFile, removeBracesFromArrowFunction, removeAllUnusedIdentifiers } from '../src/refactors';

describe('fileSpec', () => {

  it('moveToNewFile refactor', () => {
    const project = new Project()
    const code = `
export class Class1 {}
const c = new Class1()
`
    const f = project.createSourceFile('f1.ts', code)

    const result = moveToNewFile(project, [f.getClass('Class1')])
    // console.log(result);

    expect(f.getText()).not.toContain('class Class1')
    expect(f.getText()).toContain('import { Class1 } from "./Class1";')
    const newFile = project.getSourceFile('Class1.ts')
    expect(newFile.getText()).toContain('export class Class1')

    expect(result.created[0].getBaseName()).toBe('Class1.ts')
    expect(result.modified[0].getBaseName()).toBe('f1.ts')

  })

  it('addBracesToArrowFunction', () => {
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


  it('addBracesToArrowFunction', () => {
    const project = new Project()
    const code = `
const c = a => {return a + 1; }
`
    const f = project.createSourceFile('f1.ts', code)
    const arrow = f.getFirstDescendant(TypeGuards.isArrowFunction)
    removeBracesFromArrowFunction(project, arrow)

    expect(f.getText()).toContain(`const c = a => a+1`)

  })


  it('convertToEs6Module', () => {
    const project = new Project({useVirtualFileSystem: true})
    const code = `
    const r = require('f')
    const f = foo('r')
    import {foo} from 'bar'
    `
    const f = project.createSourceFile('f1.ts', code)

    convertToEs6Module(project, f)

    expect(f.getText()).toContain('import r=require(\'f\');')

  })


  it('removeAllUnusedIdentifiers', () => { 
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
    project.createSourceFile('f2.ts', `import {f} from './f1';f()`)
    removeAllUnusedIdentifiers(project, f)//, f.getFunction('foo'))

    expect(f.getText()).toBe(`export function f(){}
    function foo(){}
    foo()
    `)
    // expect(f.getText()).toContain('import r from \'f\';')

  })


})

// const r = require('f')