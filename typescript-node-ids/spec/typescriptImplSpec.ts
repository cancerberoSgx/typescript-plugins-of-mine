import {typeScriptImpl as impl, TypeScriptId} from '../src/index'
import { Program, isIdentifier, SourceFile, Node } from 'typescript'
import { findChild, createProgram, visitChildrenRecursiveDeepFirst } from 'typescript-ast-util'
import { logTime } from './testUtil';
import { readFileSync } from 'fs';

// const typescript = createTypeScriptImpl()

function doTest(file1: SourceFile, node1: Node, node1KnownId: string){
  visitChildrenRecursiveDeepFirst(file1, node=>(expect(impl.getId(node)).toBeDefined(), undefined))
  expect(node1 && impl.getId(node1)).toBe(node1KnownId)
  expect(logTime(()=>impl.getNodeById(file1, node1KnownId))).toBe(node1)
  const customId = '_cus123t$/(om_id123_'+Date.now()
  impl.setId(node1, customId)
  expect(logTime(()=>impl.getNodeById(file1, customId))).toBe(node1)
}

describe('typescript.install', () => {
  
  let program:Program
  let file1: SourceFile
  let node1: Node
  let node1KnownId: TypeScriptId

  let node2: Node
  let file2: SourceFile
  let node2KnownId: TypeScriptId
  
  beforeEach(()=>{
    program = createProgram([
      {
        fileName: 'src/test1.ts',
        content: `
import {typescript.install} from '../src/index'
describe('format', () => {
  it('typescript.install', () => {
    const one = 1
    const program = createProgram([])
  })
})
`
      }, 
      {
        fileName: 'ts.d.ts', 
        content: readFileSync('node_modules/typescript/lib/typescript.d.ts').toString()
      }
    ])
    file1 = program.getSourceFile('src/test1.ts') || null as any
    if (!file1) { return fail('cannot get source file src/test1.ts') }
    node1 = findChild(file1, n => isIdentifier(n) && n.getText() === 'one') || null as any
    node1KnownId = '0.0.1.0.2.1.0.0.2.1.0.0.0.0'
    if (!node1) { return fail('cannot find node1') }
    expect(logTime(() => impl.install(file1))).toBe(file1)


    file2 = program.getSourceFile('ts.d.ts') || null as any
    if (!file2) { return fail('cannot get source file ts.d.ts') }
    node2 = findChild(file2, n => isIdentifier(n) && n.getText() === 'emitOnlyDtsFiles') || null as any
    if (!node2) { return fail('cannot find node2') }
    node2KnownId= '0.0.20.2.15.53.2.0'
    
    expect(logTime(() => impl.install(file2))).toBe(file2)
  })

  it('typescript.install, typescript.getId, typescript.getNodeById, typescript.setId', () => {
    doTest(file1, node1, node1KnownId)
    doTest(file2, node2, node2KnownId)
  })

})