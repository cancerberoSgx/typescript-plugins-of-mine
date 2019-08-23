import { Project } from 'ts-morph'
import { format, formatString } from '../../src/refactor/format'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('format', () => {
  const code = `
const {r, log, g} = require('f');
class C{
m():number[]{
return [
                                1,
  2,     3
]}}
function f(){
alert(1)
log(2,function(){
return 1 + g(a=>{
return "2"
})
});
}
export const c = 1;var ggg = 1;
f();
[1,2].join('');
(true||false) && f()
for(let i = 0; i< 2; i++){}
    `

  it('should format according using default settings', () => {
    const project = new Project()
    const file = project.createSourceFile('f1.ts', code)
    expectNoErrors(project)
    const output = format({ file, project })
    const expected = `
const { r, log, g } = require('f');
class C {
    m(): number[] {
        return [
            1,
            2, 3
        ]    
}
}
function f() {
    alert(1)
    log(2, function() {
        return 1 + g(a => {
            return "2"
        })
    });
}
export const c = 1; var ggg = 1;
f();
[1, 2].join('');
(true || false) && f()
for (let i = 0; i < 2; i++) { }
`.trim()
    expectEqualsAndDiff(output.getText().trim(), expected)
  })

  it('should remove semicolons and tab 2 spaces', () => {
    const project = new Project()
    expectNoErrors(project)
    const file = project.createSourceFile('f1.ts', code)
    const output = format({
      file,
      project,
      trailingSemicolons: 'never',
      indentSize: 2
    })
    const expected = `
const { r, log, g } = require('f')
class C {
  m(): number[] {
    return [
      1,
      2, 3
    ]  
}
}
function f() {
  alert(1)
  log(2, function() {
    return 1 + g(a => {
      return "2"
    })
  })
}
export const c = 1; var ggg = 1
f();
[1, 2].join('');
(true || false) && f()
for (let i = 0; i < 2; i++) { }
`.trim()
    expectEqualsAndDiff(output.getText().trim(), expected)
  })

  it('should formatString', () => {
    const output = formatString({
      code,
      trailingSemicolons: 'never',
      indentSize: 2
    })
    const expected = `
const { r, log, g } = require('f')
class C {
  m(): number[] {
    return [
      1,
      2, 3
    ]  
}
}
function f() {
  alert(1)
  log(2, function() {
    return 1 + g(a => {
      return "2"
    })
  })
}
export const c = 1; var ggg = 1
f();
[1, 2].join('');
(true || false) && f()
for (let i = 0; i < 2; i++) { }
`.trim()
    expectEqualsAndDiff(output.trim(), expected)
  })

  it('should format jsdocs', () => {
    const code = `
/**
 *          dsd
 */
export const a = 1
/**
hjahsd
 */
export class C {
  /**
    fosd
 * @param {number} a foo bar
      @returns {number} jfjfjf
   */
  m(a:number) { return 1 }
}
export interface I {
  m(a:number): {
    o:string[]
    b: (g:{
  /** hello */
      p:boolean
      })=>void,
    uu: {
  /**
hello world
*/
      o:number
    }
  }
}
/**
<a name="d3/d63/classcv_1_1Mat_1CVMat_Details"></a> The class [Mat](#d3/d63/classcv_1_1Mat}) represents

Source: [opencv2/core/mat.hpp](https://github.com/opencv/opencv/tree/master/modules/core/include/opencv2/core/mat.hpp#L2073).

*/
declare class Mat {

  /**
  
  Source: [opencv2/core/mat.hpp](https://github.com/opencv/opencv/tree/ccecd3405a22cd4ed4446574f8465fc7024f7708/modules/core/include/opencv2/core/mat.hpp#L2096).
  
  */
  public allocator: Date
}
`.trim()
    const expected = `
/**
 *          dsd
 */
export const a = 1
/**
 * hjahsd
 */
export class C {
  /**
   *     fosd
   * @param {number} a foo bar
   *       @returns {number} jfjfjf
   */
  m(a: number) { return 1 }
}
export interface I {
  m(a: number): {
    o: string[]
    b: (g: {
      /**
       * hello
       */
      p: boolean
    }) => void,
    uu: {
      /**
       * hello world
       */
      o: number
    }
  }
}
/**
 * <a name="d3/d63/classcv_1_1Mat_1CVMat_Details"></a> The class [Mat](#d3/d63/classcv_1_1Mat}) represents
 * 
 * Source: [opencv2/core/mat.hpp](https://github.com/opencv/opencv/tree/master/modules/core/include/opencv2/core/mat.hpp#L2073).
 * 
 */
declare class Mat {

  /**
   *   
   *   Source: [opencv2/core/mat.hpp](https://github.com/opencv/opencv/tree/ccecd3405a22cd4ed4446574f8465fc7024f7708/modules/core/include/opencv2/core/mat.hpp#L2096).
   *   
   */
  public allocator: Date
}`.trim()
    const project = new Project()
    expectNoErrors(project)
    const file = project.createSourceFile('f1.ts', code)
    format({
      file,
      project,
      trailingSemicolons: 'never',
      indentSize: 2,
      formatJsdocs: true
    })
    // console.log(file.getFullText().trim());
    expectNoErrors(project)
    expectEqualsAndDiff(file.getFullText().trim(), expected)
  })

})
