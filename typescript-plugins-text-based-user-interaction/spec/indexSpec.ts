import { buildUserCalls, create, Tool } from "../src";

describe('guiNoMore', () => {

  const tool = create({
    prefix: '&%&%',
    actions: [
      {
        name: 'moveThisFileTo',
        args: ['dest'],
        print: (action) => `Move this file to ${action.args.dest}`,
        snippet: 'moveThisFileTo(\'../newName.ts\')'
      },
      {
        name: 'moveThisFolderTo',
        args: ['dest'],
        print: (action) => `Move this folder to ${action.args.dest}`,
        snippet: 'moveThisFolderTo(\'../newName\')'
      },
      {
        name: 'signatureChangeParameterOrder',
        args: ['config'],
        print: (action) => `Change parameter order of ${action.args.config.functionName}`,
        snippet: 'moveThisFolderTo(\'../newName\')'
      },
      {
        name: 'otherOperation',
        args: ['a', 'b'],
        print: (action) => `other one`,
        snippet: 'otherOperation(1,2)'
      }
    ]
  }) as Tool


  const file1 = `
import * as x from 'foo'
// &%&% moveThisFileTo('/home/sg/git/proj1/src/model/units/Warrior.ts') 
function f(){}
// &%&% moveThisFolderTo('../foo/bar') 
export function a (){}
// &%&% signatureChangeParameterOrder({
// &%&%   functionName: 'f',
// &%&%   originalParameters: "a: string, b: number",
// &%&%   reorderedParameters: "a: string, b: number"
// &%&% })
export function b (){}
function c(a:number){}
/* &%&% otherOperation(1,'hello') */

`


  it('findActions should return actions declared in given file ', () => {
    const actions = tool.findActions(file1)
    
    const userCalls = buildUserCalls(file1, (tool as any).config as any)
    // console.log(userCalls);
    expect(userCalls.length).toBe(4)
    expect(actions.find(a => a.name === 'moveThisFileTo').args.dest).toBe('/home/sg/git/proj1/src/model/units/Warrior.ts')
    expect(actions.find(a => a.name === 'moveThisFolderTo').args.dest).toBe('../foo/bar')
    expect(actions.find(a => a.name === 'signatureChangeParameterOrder').args.config.functionName).toBe('f')
    expect(actions.find(a => a.name === 'signatureChangeParameterOrder').args.config.originalParameters).toBe('a: string, b: number')
    expect(actions.find(a => a.name === 'otherOperation').args.a).toBe(1)
    expect(actions.find(a => a.name === 'otherOperation').args.b).toBe('hello')
    expect(actions.length).toBe(4)
  })
})