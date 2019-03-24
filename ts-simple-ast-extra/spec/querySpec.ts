import Project, { Identifier, TypeGuards } from 'ts-morph';
import { buildSelector, selectNode } from "..";

describe('ExtractInterface', () => {
  it('should create an interface from given class with only public members, jsdocs and correct types and type params', () => {
    const project = new Project()
    project.createSourceFile(
      'test.ts',
      `
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
    var jacinto = [0,false]
    return new Date()
  }
  private g(){return 1}
}      `
    )
    const f = project.getSourceFile('test.ts')!
    const n = f.getDescendants().filter(TypeGuards.isIdentifier).find(i => i.getText() === 'jacinto')!
    const sel = buildSelector(n)
    const n2 = selectNode<Identifier>(sel, f)
    expect(n.getText()).toBe(n2!.getText())
  })
})