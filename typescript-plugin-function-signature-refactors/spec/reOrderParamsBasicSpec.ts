import Project, { NamedNode, SourceFileEmitOptions, Node, SourceFile, ReferenceFindableNode, SignaturedDeclaration } from "ts-simple-ast";
import { reorderParameters } from "../src/reorderParams";
import { doTest, printDiagnostics, reorderAndAssert } from "./testUtil";

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
    // printDiagnostics(test.project)

    reorderAndAssert({
      asserts: [
      {
        file: test.files.index, 
        before: `console.log(helper('param', 3.14, true))`, 
        after: `console.log(helper(3.14, 'param', true)`,
      }
    ],
    node: test.files.helper.getFunction('helper'), 
    reorder: [1,0] 
  })
//   reorderAndAssert({
//     asserts: [
//     {
//       file: test.files.helper, 
//       // before: `export function helper(param1: string, param2: number, param3: boolean)`, 
//       after: `export function helper(param2: number, param1: string, param3: boolean)`,
//     }
//   ],
//   // node: test.files.helper.getFunction('helper'), 
//   // reorder: [1,0] 
// })
    // const targetFunction = test.files.helper.getFunction('helper')
    // expect(test.files.index.getText()).not.toContain(`console.log(helper(3.14, 'param', true)`)
    // reorderParameters(targetFunction, [1, 0])
    // expect(test.files.index.getText()).toContain(`console.log(helper(3.14, 'param', true)`)


    // test = run()
  })


  const dataWithClassesAndInterfaces={
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

    // printDiagnostics(test.project)

    reorderAndAssert({
      node: test.files.Animal.getClass('Animal').getMethod('born'), 
      reorder: [1, 0],
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
    // console.log(test.files.Animal.getClass('Animal').getMethod('born').getText());
    // test.project.saveSync()
    // test.files.Animal.refreshFromFileSystemSync()
// console.log('\nBEFORE: ',test.files.Animal.getClass('Animal').getMethod('born').getText());

    // reorderAndAssert({
    //   asserts: [
    //     {
    //     before: 'born(when: Date, parents: Alive[], where: number[], why: string)',
    //     after:  'born(parents: Alive[], why: string, where: number[], when: Date)',
    //     file: test.files.Animal, 
    //   }
    // ],
    //   node: test.files.Animal.getClass('Animal').getMethod('born'), 
    //   reorder: [1, 3, 2]
    // })
    // test.project.saveSync()
    // test.files.Animal.refreshFromFileSystemSync()
    // console.log('\nAFTER: ',test.files.Animal.getClass('Animal').getMethod('born').getText());



    // const decl = test.files.Animal.getClass('Animal').getMethod('born')
    // let before = `born(parents: Alive[], when: Date, where: number[], why: string)`
    // let after = `born(when: Date, parents: Alive[], where: number[], why: string)`
    // expect(test.files.Animal.getText()).toContain(before)
    // expect(test.files.Animal.getText()).not.toContain(after)
    // reorderParameters(decl, [1, 0])
    // expect(test.files.Animal.getText()).not.toContain(before)
    // expect(test.files.Animal.getText()).toContain(after)

    // before ='born(when: Date, parents: Alive[], where: number[], why: string)'
    // after = 'born(when: Date, parents: Alive[], where: number[], why: string)'
    // expect(test.files.Animal.getText()).toContain(before)
    // expect(test.files.Animal.getText()).not.toContain(after)
    // reorderParameters(decl, [1, 0])
    // expect(test.files.Animal.getText()).not.toContain(before)
    // expect(test.files.Animal.getText()).toContain(after)

    // test = doTest(dataWithClassesAndInterfaces)
    // const decl = test.files.Animal.getClass('Animal').getMethod('born')
    // console.log(decl.getText())
    // reorderParameters(decl, [1, 3, 2])
    // console.log(decl.getText())



    
    // const targetSignature = test.files.types.getInterface('Alive').getMethod('born')
    // // expect(test.files.types.getText()).toContain(`born(parents: Alive[], when: Date, `)
    // // expect(test.files.types.getText()).not.toContain(`born(when: Date, parents: Alive[]`)
    // console.log(test.files.types.getText());
    // reorderParameters(targetMethod, [1, 2, 0])
    // console.log(test.files.types.getText());
    // // expect(test.files.types.getText()).not.toContain(`born(parents: Alive[], when: Date, `)
    // // expect(test.files.types.getText()).toContain(`born(when: Date, parents: Alive[]`)

    
    // expect(test.files.index.getText()).toContain(`console.log(helper(3.14, 'param', true)`)
  })


})

