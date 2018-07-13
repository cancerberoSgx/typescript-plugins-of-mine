import { install, getId } from '../src/index'
import { Program, isIdentifier } from 'typescript';
import { printNode } from './testUtil';
import { visit_forEachChild } from '../src/util';
import { fromNow } from 'hrtime-now'
import { findChild, createProgram } from 'typescript-ast-util'

describe('install', () => {
  it('install in a source file should put ids to every node', () => {

    const program = createProgram([
      {
        fileName: 'src/test1.ts',
        content: `
import {install} from '../src/index'
describe('format', () => {
  it('install', () => {
    const one = 1
    const program = createProgram([])
  })
})
`
      }
    ])

    const test1 = program.getSourceFile('src/test1.ts')
    if (!test1) { return fail('cannot get source file') }

    const result = fromNow(
      () => install(test1),
      t => console.log(`install took ${t}`)
    )

    const node1 = findChild(test1, n => isIdentifier(n) && n.getText() === 'one')
    expect(node1 && getId(node1)).toBe('0.0.1.0.2.1.0.0.2.1.0.0.0.0')

    

    // console.log(getId(findChild(test1, n=>isIdentifier(n) && n.getText()==='one')!))
    // program.getSourceFiles().forEach(sourceFile => {
    //   console.log(`=== AST of ${sourceFile.fileName} ==`)
    //   visit_forEachChild(sourceFile, (n, level, childIndex, parentNode) => console.log(printNode(n, level, childIndex, parentNode)), sourceFile)
    // })
    // console.log(getId(test1))
  })
})