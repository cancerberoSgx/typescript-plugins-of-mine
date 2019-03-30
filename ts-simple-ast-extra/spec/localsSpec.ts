import { createProject } from './testUtil';
import {getNodeLocalNamesNotReferencing} from '../src'
describe('locals1', ()=>{
  it('getNodeLocalNamesNotReferencing', ()=>{
    const { project, f1, f2 } = createProject(`
      export interface I {}
    `, `
      import { I } from "./f1"
      export const c: I = {}
    `)
      expect(getNodeLocalNamesNotReferencing(f2, f1.getInterfaceOrThrow('I'))).toEqual(['c'])
  })
})