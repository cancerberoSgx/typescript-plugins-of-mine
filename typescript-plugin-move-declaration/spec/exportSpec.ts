import { moveNode } from '../src/moveNode';
import { assertProjectNoErrors, createProject, sourceFileEquals } from './testUtil';

describe('testing dependencies from libraries', () => {


  it('imports with multiple names - failing', () => {

    const project = createProject()
    const f1File = project.createSourceFile('f1.ts', `
export function f1(){}
export const x=1
export interface a {}
  `)

    const indexFile = project.createSourceFile('index.ts', `
export * from './f1'
`)

    const f2File = project.createSourceFile('f2.ts', `
import {x, f1, a} from './index'
function f3(){
  const aux = x + 1
  return f1()
}
interface b extends a {}
  `)
    const f1 = f1File.getFunction('f1')

    const destFile = project.createSourceFile('dest.ts', '')
    assertProjectNoErrors(project)
    moveNode(f1, destFile, project)
    assertProjectNoErrors(project)
    // console.log('dest\n', destFile.getText());
    // console.log('f1\n', f1File.getText());
    // console.log('index\n', indexFile.getText());
    // console.log('f2\n', f2File.getText());

    sourceFileEquals(destFile, `
export function f1() {
}
  `)
    sourceFileEquals(f1File, `
export const x=1
export interface a {}
   `)

    sourceFileEquals(indexFile, `
   export * from './f1'
   export { f1 } from "./dest";
   
      `)
    sourceFileEquals(f2File, `
import {x, f1, a} from './index'
function f3(){
  const aux = x + 1
  return f1()
}
interface b extends a {}

  `)

  })


})
