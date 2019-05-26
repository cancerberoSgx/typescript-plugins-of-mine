// /**
// Tool to automatically add (most) of the missing types to a JS file or project while migrating to TS.

//  * it will tun the "infer X form usage" TypeScript compiler fixes on given file or project0
//  * if a projectis given it will try to organize it as a typescript project, try to install @types, create a tsconfig.json enable js etc and load it as a whole instead file by file so there is more chance to infer
//  * User should be able to configure the tool declaring which variables are of which types, providing a ts prefix fragment with variable types definitions, etc.

//  */

// import { Project, SourceFile } from 'ts-morph';
// let jsTypeInference;
// interface Result {
// }

// // TODO: its probably that this thing https://github.com/Microsoft/lsif-node/tree/master/npm is able to transform a npm packkage.json project into a ts project.. so. we could analyze the project using that API to see if type inference is possible.

// export function typeInferenceAnalysis({ project, sourceFile }: {
//   project: Project;
//   sourceFile: SourceFile;
// }): Result {
//   sourceFil;
//   return null;
// }
