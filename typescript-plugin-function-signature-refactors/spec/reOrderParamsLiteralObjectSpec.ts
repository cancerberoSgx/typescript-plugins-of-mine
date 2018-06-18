import { createProjectFiles, modifyAndAssert } from "typescript-plugin-util";
import { reorderParamOperation } from './reOrderParamsBasicSpec';
import { ObjectLiteralElementLike, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript'


describe('reorder params literal objects', () => {

  it('object literal methods', () => {
    let test = createProjectFiles({
      files: [
        {
          name: 'test1',
          path: 'test1.ts',
          text: `
          import {Interface1} from './Interface1
          export const obj: Interface1 = {
            method1(a: number, b: boolean, c: Date[][]): undefined{}, 
            method2: (d: Date, isIt: boolean, names: string[]): number =>1
            method3: function(f: Date[][], isIt: boolean[], lastName: string): number{return 1}
          }
          obj.method3([[]], [true], 'gurin')
          obj.method1(1, false, [[new Date()]])
          obj.method2(date1, true, ['Sebastian'])
          `
        },
        {
          name: 'test2',
          path: 'test2.ts',
          text: `
          import {obj} from './test1
          obj.method1(2, true, [[new Date()], [new Date()]])
          obj.method2(date2, false, ['sebastian'])
          `
        },
        {
          name: 'Interface1',
          path: 'Interface1.ts',
          text: `
          export interface Interface1{
            method1(a: number,b: boolean,c: Date[][]): undefined
            method2: (d: Date, isIt: boolean, names: string[]): number
            method3: (f: Date[][], isIt: boolean[], lastName: string): number
          }
          `
        },
      ]
    })

    modifyAndAssert({
      asserts: [
        {
          file: test.files.test1,
          before: `method1(a: number, b: boolean, c: Date[][]): undefined{}`,
          after: `method1(c: Date[][], a: number, b: boolean): undefined{}`,
        }, 
        {
          file: test.files.test1,
          before: `obj.method1(1, false, [[new Date()]])`,
          after: `obj.method1([[new Date()]], 1, false)`,
        }, 
        {
          file: test.files.test2,
          before: `obj.method1(2, true, [[new Date()], [new Date()]])`,
          after: ` obj.method1([[new Date()], [new Date()]], 2, true)`,
        },
        {
          file: test.files.Interface1,
          before: `method1(a: number,b: boolean,c: Date[][]): undefined`,
          after: `method1(c: Date[][],a: number,b: boolean): undefined`,
        }
      ],
      node: test.files.test1.getVariableDeclaration('obj').getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression).getProperty('method1'),
      modification: reorderParamOperation([1, 2])
    })


    // console.log(test.files.Interface1.getText());


    modifyAndAssert({
      asserts: [
        {
          file: test.files.test1,
          before: `method2: (d: Date, isIt: boolean, names: string[]): number =>1`,
          after: `method2: (isIt: boolean, names: string[], d: Date): number =>1`,
        }, 
        {
          file: test.files.test2,
          before: `obj.method2(date2, false, ['sebastian'])`,
          after: `obj.method2(false, ['sebastian'], date2)`,
        }, 
        {
          file: test.files.Interface1,
          before: `method2: (d: Date, isIt: boolean, names: string[]): number`,
          after: `method2: (isIt: boolean, names: string[], d: Date): number`,
        }
      ],
      node: test.files.test1.getVariableDeclaration('obj').getFirstChildByKind(ts.SyntaxKind.ObjectLiteralExpression).getProperty('method2'),
      modification: reorderParamOperation([2])
    })

    modifyAndAssert({
      asserts: [
        {
          file: test.files.test2,
          before: `obj.method2(false, ['sebastian'], date2)`,
          after: `obj.method2(['sebastian'], date2, false)`,
        }, 
      ],
      node: test.files.test2.getStatements()[2].getFirstDescendantByKind(ts.SyntaxKind.PropertyAccessExpression).getNameNode(),
      modification: reorderParamOperation([2])
    })
    
    
  })


})

