import { Project } from 'ts-morph'
import { formatJsdocs } from '../../src/refactor/formatJsdocs'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('formatJsdocs', () => {
  it('should ff ', () => {
    const code = `
/**
 * dsd
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

\`\`\`cpp
// compute the sum of positive matrix elements, optimized variant
double sum=0;
int cols = M.cols, rows = M.rows;
if(M.isContinuous())
{
    cols *= rows;
    rows = 1;
}
for(int i = 0; i < rows; i++)
{
    const double* Mi = M.ptr<double>(i);
    for(int j = 0; j < cols; j++)
        sum += std::max(Mi[j], 0.);
}
\`\`\`

Source: [opencv2/core/mat.hpp](https://github.com/opencv/opencv/tree/master/modules/core/include/opencv2/core/mat.hpp#L2073).

*/
declare class Mat {

  /**
  
  Source: [opencv2/core/mat.hpp](https://github.com/opencv/opencv/tree/ccecd3405a22cd4ed4446574f8465fc7024f7708/modules/core/include/opencv2/core/mat.hpp#L2096).
  
  */
  public allocator: Date
}
`
    const expected = `/**
 * dsd
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
 * \`\`\`cpp
 * // compute the sum of positive matrix elements, optimized variant
 * double sum=0;
 * int cols = M.cols, rows = M.rows;
 * if(M.isContinuous())
 * {
 *     cols *= rows;
 *     rows = 1;
 * }
 * for(int i = 0; i < rows; i++)
 * {
 *     const double* Mi = M.ptr<double>(i);
 *     for(int j = 0; j < cols; j++)
 *         sum += std::max(Mi[j], 0.);
 * }
 * \`\`\`
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
}
`.trim()

    const project = new Project()
    const file = project.createSourceFile('test.ts', code)
    expectNoErrors(project)
    formatJsdocs({ project, file, formatJsdocs: true })
    // console.log(file.getFullText())
    expectNoErrors(project)
    expectEqualsAndDiff(file.getFullText().trim(), expected)
  })
})
