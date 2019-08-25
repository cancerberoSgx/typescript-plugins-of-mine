import { Project } from 'ts-morph'
import { formatJsdocs } from '../../src/refactor/formatJsdocs'
import { expectEqualsAndDiff, expectNoErrors } from '../testUtil'

describe('formatJsdocs', () => {
  it('should format and indent jsdoc comments ', () => {
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
    expectNoErrors(project)
    expectEqualsAndDiff(file.getFullText().trim(), expected)
  })

  it('should wrap lines', () => {
    const code = `
/**
 * The function estimates the optimum transformation (warpMatrix) with respect to ECC criterion (EP08), that is
 * 
 *  'foo '
 * 
 * where
 * 
 *  'bar  '
 * 
 * (the equation holds with homogeneous coordinates for homography). It returns the final enhanced correlation coefficient, that is the correlation coefficient between the template image and the final warped input image. When a  '$3times 3$ ' matrix is given with motionType =0, 1 or 2, the third row is ignored.
 * 
 * Unlike findHomography and estimateRigidTransform, the function findTransformECC implements an area-based alignment that builds on intensity similarities. In essence, the function updates the initial transformation that roughly aligns the images. If this information is missing, the identity warp (unity matrix) is used as an initialization. Note that if images undergo strong displacements/rotations, an initial transformation that roughly aligns the images is necessary (e.g., a simple euclidean/similarity transform that allows for the images showing the same image content approximately). Use inverse warping in the second image to take an image close to the first one, i.e. use the flag WARP_INVERSE_MAP with warpAffine or warpPerspective. See also the OpenCV sample image_alignment.cpp that demonstrates the use of the function. Note that the function throws an exception if algorithm does not converges.
 * 
 * @param templateImage single-channel template image; CV_8U or CV_32F array.
 * @param inputImage single-channel input image which should be warped with the final warpMatrix in order to provide an image similar to templateImage, same type as templateImage.
 * @param warpMatrix floating-point $2times 3$ or $3times 3$ mapping matrix (warp).
 * @param motionType parameter, specifying the type of motion:
 * MOTION_TRANSLATION sets a translational motion model; warpMatrix is $2times 3$ with the first $2times 2$ part being the unity matrix and the rest two parameters being estimated.MOTION_EUCLIDEAN sets a Euclidean (rigid) transformation as motion model; three parameters are estimated; warpMatrix is $2times 3$.MOTION_AFFINE sets an affine motion model (DEFAULT); six parameters are estimated; warpMatrix is $2times 3$.MOTION_HOMOGRAPHY sets a homography as a motion model; eight parameters are estimated; 'warpMatrix ' is $3times 3$.
 * @param criteria parameter, specifying the termination criteria of the ECC algorithm; criteria.epsilon defines the threshold of the increment in the correlation coefficient between two iterations (a negative criteria.epsilon makes criteria.maxcount the only termination criterion). Default values are shown in the declaration above.
 * @param inputMask An optional mask to indicate valid values of inputImage.
 * @param gaussFiltSize An optional value indicating size of gaussian blur filter; (DEFAULT: 5)
 */
export declare function findTransformECC(templateImage: string, inputImage: string, warpMatrix: Date, motionType: number, criteria: Array<number>, inputMask: string, gaussFiltSize: number): number
`
    const expected = `
/**
 * The function estimates the optimum transformation (warpMatrix) with respect to
 * ECC criterion (EP08), that is
 * 
 *  'foo '
 * 
 * where
 * 
 *  'bar  '
 * 
 * (the equation holds with homogeneous coordinates for homography). It returns
 * the final enhanced correlation coefficient, that is the correlation coefficient
 * between the template image and the final warped input image. When a  '$3times
 * 3$ ' matrix is given with motionType =0, 1 or 2, the third row is ignored.
 * 
 * Unlike findHomography and estimateRigidTransform, the function findTransformECC
 * implements an area-based alignment that builds on intensity similarities. In
 * essence, the function updates the initial transformation that roughly aligns
 * the images. If this information is missing, the identity warp (unity matrix) is
 * used as an initialization. Note that if images undergo strong
 * displacements/rotations, an initial transformation that roughly aligns the
 * images is necessary (e.g., a simple euclidean/similarity transform that allows
 * for the images showing the same image content approximately). Use inverse
 * warping in the second image to take an image close to the first one, i.e. use
 * the flag WARP_INVERSE_MAP with warpAffine or warpPerspective. See also the
 * OpenCV sample image_alignment.cpp that demonstrates the use of the function.
 * Note that the function throws an exception if algorithm does not converges.
 * 
 * @param templateImage single-channel template image; CV_8U or CV_32F array.
 * @param inputImage single-channel input image which should be warped with the
 * final warpMatrix in order to provide an image similar to templateImage, same
 * type as templateImage.
 * @param warpMatrix floating-point $2times 3$ or $3times 3$ mapping matrix (warp).
 * @param motionType parameter, specifying the type of motion:
 * MOTION_TRANSLATION sets a translational motion model; warpMatrix is $2times 3$
 * with the first $2times 2$ part being the unity matrix and the rest two
 * parameters being estimated.MOTION_EUCLIDEAN sets a Euclidean (rigid)
 * transformation as motion model; three parameters are estimated; warpMatrix is
 * $2times 3$.MOTION_AFFINE sets an affine motion model (DEFAULT); six parameters
 * are estimated; warpMatrix is $2times 3$.MOTION_HOMOGRAPHY sets a homography as
 * a motion model; eight parameters are estimated; 'warpMatrix ' is $3times 3$.
 * @param criteria parameter, specifying the termination criteria of the ECC
 * algorithm; criteria.epsilon defines the threshold of the increment in the
 * correlation coefficient between two iterations (a negative criteria.epsilon
 * makes criteria.maxcount the only termination criterion). Default values are
 * shown in the declaration above.
 * @param inputMask An optional mask to indicate valid values of inputImage.
 * @param gaussFiltSize An optional value indicating size of gaussian blur filter;
 * (DEFAULT: 5)
 */
export declare function findTransformECC(templateImage: string, inputImage: string, warpMatrix: Date, motionType: number, criteria: Array<number>, inputMask: string, gaussFiltSize: number): number
`.trim()
    const project = new Project()
    const file = project.createSourceFile('test.ts', code)
    expectNoErrors(project)
    formatJsdocs({ project, file, formatJsdocs: true, lineBreak: 80 })
    expectNoErrors(project)
    expectEqualsAndDiff(file.getFullText().trim(), expected)
  })
})
