import { findReferencesDeclaredOutside, moveNode } from '../src/moveNode';
import Project, { TypeGuards } from 'ts-simple-ast';
import { sourceFileEquals } from './testUtil';

describe('testing two files simple', () => {

  const project = new Project({ useVirtualFileSystem: true })
  project.createSourceFile('f1.ts', `
export function f1(a: number){}
`)
  const f2File = project.createSourceFile('f2.ts', `
import {f1} from './f1'
function f3(){}
function f2(){
  const a = 1
  return f3(f1(a))
}
function f4(){
  return f2()
}
`)

  const f2 = f2File.getFunction('f2')

  it('moveNode must import all nodes used by node that are declared outside it but not imported . Make sure they are exported', () => {
    const destFile = project.createSourceFile('dest.ts', '')
    moveNode(f2, destFile, project)
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
    export function f3(){} 
    function f4(){ 
      return f2()
    }
`)


  })
})
