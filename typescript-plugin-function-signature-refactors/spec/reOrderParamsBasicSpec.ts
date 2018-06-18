import { Node, ReferenceFindableNode } from 'ts-simple-ast';
import { reorderParameters } from '../src/refactors/reorderParams/reorderParams';
import { doTest, modifyAndAssert } from "./testUtil";

function operation(reorder: number[]) {
  return function (node: ReferenceFindableNode & Node) {
    reorderParameters(node, reorder, console.log)
  }
}
describe('try to change signature param type', () => {

  it('simple - function declaration sibling', () => {
    let test = doTest({
      files: [
        {
          name: 'helper',
          path: 'model/helper.ts',
          text: `export function helper(param1: string, param2: number, param3: boolean): string {
              return param1 + ' and '+param2 + ' and ' +param3
            }`
        },
        {
          path: 'index.ts',
          name: 'index',
          text: `import {helper} from './model/helper'
          console.log(helper('param', 3.14, true))`
        }
      ]
    })

    modifyAndAssert({
      asserts: [
        {
          file: test.files.index,
          before: `console.log(helper('param', 3.14, true))`,
          after: `console.log(helper(3.14, 'param', true)`,
        }, {
          file: test.files.helper,
          before: `export function helper(param1: string, param2: number, param3: boolean): string`,
          after: `export function helper(param2: number, param1: string, param3: boolean): string`,
        }
      ],
      node: test.files.helper.getFunction('helper'),
      modification: operation([1, 0])
    })

    modifyAndAssert({
      asserts: [
        {
          file: test.files.index,
          before: `console.log(helper(3.14, 'param', true)`,
          after: `console.log(helper('param', true, 3.14)`,
        },
        {
          file: test.files.helper,
          before: `export function helper(param2: number, param1: string, param3: boolean): string`,
          after: `export function helper(param1: string, param3: boolean, param2: number): string`,
        }
      ],
      node: test.files.helper.getFunction('helper'),
      modification: operation([2, 0, 1])
    })

    modifyAndAssert({
      asserts: [
        {
          file: test.files.index,
          before: `console.log(helper('param', true, 3.14)`,
          after: `console.log(helper(true, 3.14, 'param')`,
        },
        {
          file: test.files.helper,
          before: `export function helper(param1: string, param3: boolean, param2: number): string`,
          after: `export function helper(param3: boolean, param2: number, param1: string): string`,
        }
      ],
      node: test.files.helper.getFunction('helper'),
      modification: operation([2])
    })

  })


  const dataWithClassesAndInterfaces = {
    files: [
      {
        name: 'types',
        path: 'model/types.ts',
        text: `
          export interface Alive extends Thing {
            constructor(environment?: Environment, track?: boolean, immortal?: boolean)
            consume(things: Thing[], env?: Environment): Promise<void>
            born(parents: Alive[], when: Date, where: number[], why: string): boolean
          }
          export interface Environment extends Thing {}
          export interface Thing {}
          `
      },
      {
        name: 'Animal',
        path: 'model/Animal.ts',
        text: `
          import {Alive, Environment, Thing} from './types'
          export class Animal implements Alive {
            constructor(private environment?: Environment, private track: boolean=true, public immortal: boolean=false){}
            consume(things: Thing[], env?: Environment){ return Promise.resolve()}
            born(parents: Alive[], when: Date, where: number[], why: string){return true}
          }
          export function create(environment?: Environment): Animal { return new Animal(environment)}
         `
      },
      {
        path: 'index.ts',
        name: 'index',
        text: `
          import {create, Animal} from './model/Animal'
          const a: Animal = create()
          a.consume([]).then(()=>console.log('f'))
          a.born([], new Date(), [1,2], 'just because').then(() => console.log('f'))
        `
      }
    ]
  }


  it('method declarations and signatures', () => {
    let test = doTest(dataWithClassesAndInterfaces)
    modifyAndAssert({
      node: test.files.Animal.getClass('Animal').getMethod('born'),
      modification: operation([1, 0]),
      asserts: [
        {
          file: test.files.types,
          before: `born(parents: Alive[], when: Date, where: number[], why: string)`,
          after: `born(when: Date, parents: Alive[], where: number[], why: string)`,
        },
        {
          file: test.files.Animal,
          before: `born(parents: Alive[], when: Date, where: number[], why: string)`,
          after: `born(when: Date, parents: Alive[], where: number[], why: string)`,
        },
        {
          file: test.files.index,
          before: `a.born([], new Date(), [1,2], 'just because').then`,
          after: `a.born(new Date(), [], [1,2], 'just because').then`,
        }
      ],
    })
    modifyAndAssert({
      asserts: [
        {
          before: 'born(when: Date, parents: Alive[], where: number[], why: string)',
          after: 'born(where: number[], when: Date, why: string, parents: Alive[])',
          file: test.files.Animal,
        }
      ],
      node: test.files.Animal.getClass('Animal').getMethod('born'),
      modification: operation([1, 3, 0])
    })
  })


})

