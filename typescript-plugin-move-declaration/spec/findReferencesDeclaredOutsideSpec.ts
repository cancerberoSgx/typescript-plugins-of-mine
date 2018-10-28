import { findReferencesDeclaredOutside, moveNode } from '../src/moveNode';
import Project, { TypeGuards } from 'ts-simple-ast';
import { sourceFileEquals } from './testUtil';

describe('findReferencesDeclaredOutside', () => {

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
`)

  const f2 = f2File.getFunction('f2')

  it('outside are only f1 and f3 , but only f1 was imported', () => {
    const refsOutside = findReferencesDeclaredOutside(f2)
  
    expect(refsOutside.length && refsOutside.find(r => !['f1', 'f3'].includes(r.getText()))).toBeFalsy()

    const refsOutsideImported = refsOutside.filter(r=>r.getFirstAncestor(TypeGuards.isImportDeclaration))

    expect(refsOutsideImported.length && refsOutsideImported.find(r => r.getText() !== 'f1')).toBeFalsy()
  })

  it('inside are only f2 and a', () => {
    const refsInside = findReferencesDeclaredOutside(f2, false)

    // console.log('Inside: '+refsInside.map(r=>r.getText()).join(', '));
    expect(refsInside.find(r => !['a', 'f2'].includes(r.getText()))).toBeFalsy()
  })

  it('moveNode must import all nodes used by node that are declared outside it but not imported . Make sure they are exported', ()=>{
    const destFile = project.createSourceFile('dest.ts', '')
    moveNode(f2, destFile)
    sourceFileEquals(destFile, `
import { f1 } from "./f1";
import { f3 } from "./f2";

export function f2() {
    const a = 1
    return f3(f1(a))
}
`)

sourceFileEquals(f2File, `export function f3(){}`)
    // console.log(destFile.getText());
    // console.log(f2File.getText());
  })
})
