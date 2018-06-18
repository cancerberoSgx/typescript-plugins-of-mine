import { createProjectFiles, modifyAndAssert } from "typescript-plugin-util";
import { operation } from './reOrderParamsBasicSpec';


describe('reorder params on other members than methods', () => {

  it('constructors', () => {
    let test = createProjectFiles({
      files: [
        {
          name: 'Thing',
          path: 'model/Thing.ts',
          text: `
          export interface Thing {
            constructor(name: string, description: string, storeCreateDate: boolean)
          }
          class ThingImpl implements Thing {
            constructor(private name: string, private description: string, private storeCreateDate: boolean){}
          }
          `
        },
      ]
    })

    modifyAndAssert({
      asserts: [
        // {
        //   file: test.files.index,
        //   before: `console.log(helper('param', 3.14, true))`,
        //   after: `constructor(private description: string, private name: string, private storeCreateDate: boolean)`,
        // }, {
        //   file: test.files.helper,
        //   before: `export function helper(param1: string, param2: number, param3: boolean): string`,
        //   after: `export function helper(param2: number, param1: string, param3: boolean): string`,
        // }
      ],
      node: test.files.Thing.getClass('ThingImpl').getConstructors()[0],
      modification: operation([1, 0])
    })
    console.log(test.files.Thing.getText());

    test.project.getLanguageService().getDefinitionsAtPosition
    
  })


})

