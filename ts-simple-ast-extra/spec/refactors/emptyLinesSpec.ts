import { Project } from 'ts-morph'
import { emptyLines } from '../../src'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('should remove empty lines if consecutive', () => {
  it('simple all', () => {
    const project = new Project()
    const code = `
/**
hello

ff
 
   
ss
 
    
*/


export var a = 1



function f(){}
  
  
 
export const e = f()
    `.trim()
    const expected = `
/**
hello

ff

ss

*/

export var a = 1

function f(){}

export const e = f()
`.trim()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    emptyLines({ file, project , emptyLinesMax: 1})
    expectEqualsAndDiff(file.getFullText().trim(), expected)
    expectNoErrors(project)
  })
})
