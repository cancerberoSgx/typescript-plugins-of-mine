import { create, ToolConfig } from "../src";

describe('guiNoMore', () => {
  it('findActions should return actions declared in given file ', () => {

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
        }
      ]
    })


    const file1 = `
  import * as x from 'foo'
  // &%&% moveThisFileTo('/home/sg/git/proj1/src/model/units/Warrior.ts') 
  // &%&% moveThisFolderTo('../foo/bar') 
  export function a (){}
  `
    const actions = tool.findActions(file1)
    expect(actions.find(a => a.name === 'moveThisFileTo').args.dest).toBe('/home/sg/git/proj1/src/model/units/Warrior.ts')
    expect(actions.find(a => a.name === 'moveThisFolderTo').args.dest).toBe('../foo/bar')
    expect(actions.length).toBe(2)
  })
})