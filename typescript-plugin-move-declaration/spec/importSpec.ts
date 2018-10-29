import { moveNode } from '../src/moveNode';
import Project, { TypeGuards } from 'ts-simple-ast';
import { sourceFileEquals } from './testUtil';

describe('testing dependencies from libraries', () => {

  const project = new Project({ useVirtualFileSystem: true })

  const f2File = project.createSourceFile('f2.ts', `
import {f1} from 'a-library-f1'
function f3(){}
export function f4(a){
  return f2(f1(a))
}
function f2(){
  return f3(f1(2))
}
`)

  const f2 = f2File.getFunction('f2')

  it('dependencies from libraries', () => {
    const destFile = project.createSourceFile('dest.ts', '')
    moveNode(f2, destFile, project)
    
    sourceFileEquals(destFile, `
import { f1 } from "a-library-f1";
import { f3 } from "./f2";

export function f2() {
    return f3(f1(2))
}
 `)


    sourceFileEquals(f2File, `
import { f1 } from 'a-library-f1';
import { f2 } from "./dest";

export function f3(){}
export function f4(a){
  return f2(f1(a))
}
`)


  })
})
