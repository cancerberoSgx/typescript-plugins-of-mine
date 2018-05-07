import { filterChildren, compileProject } from "../src";
import * as ts from "typescript/lib/tsserverlibrary";

export function findAllProgramClasses(program: ts.Program) : ts.ClassDeclaration[]{
  let allClasses: ts.ClassDeclaration[] = []
  program.getSourceFiles().forEach(sf => {
    const classesInFile = filterChildren(sf, (n => n.kind === ts.SyntaxKind.ClassDeclaration), true)
    allClasses = allClasses.concat(classesInFile as ts.ClassDeclaration[])
  })
  return allClasses
}

const program = compileProject('../typescript-plugin-extract-interface-client-project1')
const allClasses = findAllProgramClasses(program)





// export function findSubClassesAll(node: ts.ClassDeclaration) {

//   let allClasses: ts.ClassDeclaration[] = []
//   // const sourceFiles = program.getSourceFiles()

//   program.getSourceFiles().forEach(sf => {
//     const classesInFile = filterChildren(sf, (n => n.kind === ts.SyntaxKind.ClassDeclaration), true)
//     allClasses = allClasses.concat(classesInFile as ts.ClassDeclaration[])
//   })
//   return 'allclasses: '+allClasses.join(', ')
// }

