import { tsSimpleAstImpl as impl, TsSimpleAstId } from '../src'
import Program, { SourceFile, Node, TypeGuards, MethodDeclaration, Identifier, StatementedNode, VariableDeclarationKind, ClassDeclaration } from 'ts-simple-ast'
import { visitChildrenRecursiveDeepFirst } from 'ts-simple-ast-extra'
import { logTime } from './testUtil';
import { readFileSync } from 'fs';


describe('ts-simple-ast-real-world example', () => {

  let program: Program
  let file1: SourceFile
  // let node1: Node
  // let node1KnownId: TsSimpleAstId

  beforeEach(() => {
    program = new Program({ useVirtualFileSystem: true })
    file1 = program.createSourceFile('src/test1.ts', `
class A {
  method1(name){
    const greeting = \`hello \${name}\`
    return greeting
  }
}
`)

    if (!file1) { return fail('cannot get source file src/test1.ts') }
    
    
  })

  it('common scenario - use third party technology like recast to refactor - we need to use strings replace - will throw', () => {
    const classA = file1.getDescendants().find(d => TypeGuards.isClassDeclaration(d) && d.getName() === 'A') as ClassDeclaration
    const innerNode = file1.getDescendants().find(d => TypeGuards.isIdentifier(d) && d.getText() === 'greeting') as Identifier
    const outerNode = file1.getDescendants().find(d => TypeGuards.isMethodDeclaration(d) && d.getName() === 'method1') as MethodDeclaration
    // file1.addStatements
    // if(!innerNode||!outerNode){
    //   return fail('!innerNode||!outerNode')
    // }
    // outerNode.rename('renamedMethod1') // doesnt throw
    // outerNode.getBody()!.replaceWithText('{}')
    classA.insertConstructor(0, {})

    // imagine we use a third party tool to parse body text and manipulate it and next we have the result that we replace s string:
    const resultString = `{
return Promise.resolve((()=>{
  const greeting = \`hello \${name}\`
  return greeting
})())
}
`

const body = outerNode.getBody()!.replaceWithText(resultString)

    // if(!TypeGuards.isStatementedNode(body)){
    //   return fail('!TypeGuards.isStatementedNode(body)')
    // }
    // body.insertVariableStatement(0, {declarationKind: VariableDeclarationKind.Const, declarations: [{name: 'pi', initializer: '3.14'}]})
    // const body = outerNode.getBody()! as StatementedNode //.add.getDescendantStatements().find(TypeGuards)

    expect(()=>innerNode.rename('renamedLogThis')).toThrowError()

    // innerNode.rename('renamedGreeting')
    console.log(outerNode.getBody()!.getText());
  })


  // it('common scenario - use getNodeById instead of ', () => {
  //   const innerNode = file1.getDescendants().find(d => TypeGuards.isIdentifier(d) && d.getText() === 'logThis') as Identifier
  //   const outerNode = file1.getDescendants().find(d => TypeGuards.isMethodDeclaration(d) && d.getName() === 'method1') as MethodDeclaration
  //   // if(!innerNode||!outerNode){
  //   //   return fail('!innerNode||!outerNode')
  //   // }
  //   outerNode.getBody()!.replaceWithText('{}')

  //   expect(()=>innerNode.rename('renamedLogThis')).toThrowError()
  //   // console.log(outerNode.getText());
  // })
})


// function doTest(file1: SourceFile, node1: Node, node1KnownId: string) {
//   visitChildrenRecursiveDeepFirst(file1, node => (expect(impl.getId(node)).toBeDefined(), undefined))
//   expect(node1 && impl.getId(node1)).toBe(node1KnownId)
//   expect(logTime(() => impl.getNodeById(file1, node1KnownId))).toBe(node1)
//   const customId = '_cus123t$/(om_id123_' + Date.now()
//   impl.setId(node1, customId)
//   expect(logTime(() => impl.getNodeById(file1, customId))).toBe(node1)
// }