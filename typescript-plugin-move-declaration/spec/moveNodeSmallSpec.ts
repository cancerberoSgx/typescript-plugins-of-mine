import { moveNode } from '../src/moveNode';
import Project, { TypeGuards } from 'ts-simple-ast';
import { sourceFileEquals, assertProjectNoErrors, createProject } from './testUtil';

describe('findReferencesDeclaredOutside', () => {

  it('moveNode must import all nodes used by node that are declared outside it but not imported . Make sure they are exported', () => {


    const project = createProject()
    project.createSourceFile('f1.ts', `
    export function f1(a: number){}
    `)
    const f2File = project.createSourceFile('f2.ts', `
    import {f1} from './f1'
    function f3(a:any){}
    function f2(){
      const a = 1
      return f3(f1(a))
    }
    function f4(){
      return f2()
    }
    `)

    const f2 = f2File.getFunction('f2')

    const destFile = project.createSourceFile('dest.ts', '')
    assertProjectNoErrors(project)
    moveNode(f2, destFile, project)
    assertProjectNoErrors(project)
    sourceFileEquals(destFile, `
import { f1 } from "./f1";
import { f3 } from "./f2";

export function f2() {
    const a = 1
    return f3(f1(a))
}
`)

    sourceFileEquals(f2File, `
    import { f2 } from "./dest"; 
    export function f3(a:any){} 
    function f4(){ 
      return f2()
    }
`)


  })



  it('move f1 that is used in file2 to file2', () => {
    const project = createProject()
    const f1File = project.createSourceFile('f1.ts', `
  export function f1(a: number){}
  export const other = 1
  `)
    const f2File = project.createSourceFile('f2.ts', `
import {f1, other} from './f1'

f1(other)
  `)

    const f1 = f1File.getFunction('f1')
    assertProjectNoErrors(project)
    moveNode(f1, f2File, project)
    assertProjectNoErrors(project)

    sourceFileEquals(f1File, `
    export const other = 1
    
    `)

    sourceFileEquals(f2File, `
import { other } from './f1';

export function f1(a: number) {
}

f1(other)

`)
  })
})
