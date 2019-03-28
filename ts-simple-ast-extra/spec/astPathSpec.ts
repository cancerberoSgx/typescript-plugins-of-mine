import { Project, Identifier, TypeGuards } from 'ts-morph';
import { buildAstPath, selectNode } from '../src';

describe('ExtractInterface', () => {
  it('Should create astPath for a node and be able to select it from a SourceFile copy', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts', `
      interface I<T=any>{
        p:T
      }
      /** comment1 */
      class A implements I<number> {
        /** comment2 */
        p=9
        protected h=0
        m(i:number){
        }
        n(){
          var aVariable1 = [0,false]
          return new Date()
        }
        private g(){return 1}
      }`    )
    const n = f.getDescendants().filter(TypeGuards.isIdentifier).find(i => i.getText() === 'aVariable1')!
    const sel = buildAstPath(n)
    const n2 = selectNode<Identifier>(sel, f.copy('test_copy.ts'))
    expect(n2!.getText()).toBe('aVariable1')
  })

  it('Should select another thing if structure changed', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts', `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }`    )!
    const n = f.getDescendants().filter(TypeGuards.isIdentifier).find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n)
    expect(selectNode<Identifier>(sel, f)!.getText()).toBe('aParameter1')
    const f2= project.createSourceFile(
      'test2.ts', `
      interface I<T=any>{
        m(i: number, g: (newParameter1: boolean, aParameter1: number)=>void)
      }`    )
    expect(selectNode<Identifier>(sel, f2)!.getText()).toBe('newParameter1')
  })

  it('Should select another thing if structure changed', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts', `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }`    )!
    const n = f.getDescendants().filter(TypeGuards.isIdentifier).find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n)
    expect(selectNode<Identifier>(sel, f)!.getText()).toBe('aParameter1')
    const f2= project.createSourceFile(
      'test2.ts', `
      interface I<T=any>{
        m(i: number, g: (newParameter1: boolean, aParameter1: number)=>void)
      }`)
    expect(selectNode<Identifier>(sel, f2)!.getText()).toBe('newParameter1')
  })


  xit('Should fail to select if verifyNodeKind is provided and structure is the same but some node kind changed in the path', () => {

  })

  xit('Should select if verifyNodeKind is provided and kinds in the path did not change', () => {

  })

  xit('Should select if kinds in the path changed but verifyNodeKind was not provided ', () => {

  })
})