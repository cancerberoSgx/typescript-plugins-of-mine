import { tsSimpleAstImpl as impl, TsSimpleAstId } from '../src'
import Program, { SourceFile, Node, TypeGuards } from 'ts-simple-ast'
import { visitChildrenRecursiveDeepFirst } from 'ts-simple-ast-extra'
import { logTime } from './testUtil';
import { readFileSync } from 'fs';


describe('tsSimpleAst.install', () => {

  let program: Program
  let file1: SourceFile
  let node1: Node
  let node1KnownId: TsSimpleAstId

  let node2: Node
  let file2: SourceFile
  let node2KnownId: TsSimpleAstId

  beforeEach(() => {
    program = new Program({ useVirtualFileSystem: true })
    file1 = program.createSourceFile('src/test1.ts', `
import {tsSimpleAst.install} from '../src/index'
describe('format', () => {
  it('tsSimpleAst.install', () => {
    const one = 1
    const program = createProgram([])
  })
})
`)
    file2 = program.createSourceFile('ts.d.ts', readFileSync('node_modules/typescript/lib/typescript.d.ts').toString())

    if (!file1) { return fail('cannot get source file src/test1.ts') }
    node1 = file1.getFirstDescendant(n => TypeGuards.isIdentifier(n) && n.getText() === 'one') || null as any
    if (!node1) { return fail('cannot find node1') }
    node1KnownId = '0.0.1.0.2.1.0.0.2.1.0.0.0.0'
    expect(logTime(() => impl.install(file1))).toBe(file1)


    file2 = program.getSourceFile('ts.d.ts') || null as any
    if (!file2) { return fail('cannot get source file ts.d.ts') }
    node2 = file2.getFirstDescendant(n => TypeGuards.isIdentifier(n) && n.getText() === 'emitOnlyDtsFiles') || null as any
    if (!node2) { return fail('cannot find node2') }
    node2KnownId = '0.0.0.2.351.4.4.0'
    expect(logTime(() => impl.install(file2))).toBe(file2)
  })

  it('install, getId, getNodeById, setId', () => {
    doTest(file1, node1, node1KnownId)
    doTest(file2, node2, node2KnownId)
  })
})


function doTest(file1: SourceFile, node1: Node, node1KnownId: string) {
  visitChildrenRecursiveDeepFirst(file1, node => (expect(impl.getId(node)).toBeDefined(), undefined))
  expect(node1 && impl.getId(node1)).toBe(node1KnownId)
  expect(logTime(() => impl.getNodeById(file1, node1KnownId))).toBe(node1)
  const customId = '_cus123t$/(om_id123_' + Date.now()
  impl.setId(node1, customId)
  expect(logTime(() => impl.getNodeById(file1, customId))).toBe(node1)
}