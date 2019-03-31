import {Project} from 'ts-morph';
import { extractInterface } from '../../src';

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
    return new Date()
  }
  private g(){return 1}
}
      `
    )
    
    const f = project.getSourceFile('test.ts')!
    extractInterface(f.getClass('A')!)

    expect(removeWhites(f.getText() )).toBe(
      removeWhites(
        `
        interface I<T=any>{
          p:T
        }
        /** comment1 */
        class A implements IA {
          /** comment2 */
          p=9
          protected h=0
          m(i:number){
          }
          n(){
            return new Date()
          }
          private g(){return 1}
        }
        
        /**
         * comment1
         */
        interface IA extends I<number> {
            /**
             * comment2
             */
            p: number;
            /**
             * TODO: Document
             */
            m(i: number): void;
            /**
             * TODO: Document
             */
            n(): Date;
        }
              
        `
      )
    )
  })
})

function removeWhites(s: string){
  return s.replace(/[\s\n]+/gm, ' ').trim()
}