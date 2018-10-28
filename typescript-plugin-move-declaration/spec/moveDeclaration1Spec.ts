// import { cat, cp, rm } from "shelljs";
// import Project, { ClassDeclaration } from "ts-simple-ast";
// import { moveDeclaration, moveDeclarationNamed } from "../src/moveDeclaration";
// import { resolve } from "path";

// let project

// describe(`move class declaration`, () => {

//   describe('moveDeclaration', () => {
//     const projectPath = `assets/sampleProject1_1_copy`
//     it(`perform refactor on sample project moving src/model/Apple:Apple to file src/model/level2/usingApples`, () => {
//       rm(`-rf`, projectPath)
//       cp(`-r`, `assets/sampleProject1`, `${projectPath}`)
//       project = new Project({
//         tsConfigFilePath: `${projectPath}/tsconfig.json`
//       });
//       const apple = getTopLevelClassNamed(project, `Apple`)
//       const targetSourceFile = project.getSourceFiles().find(sf => sf.getFilePath().includes(`usingApples.ts`))
//       if (apple && targetSourceFile) {
//         moveDeclaration(apple, project, targetSourceFile)
//       }
//     })
//     doAssert(projectPath)
//   })

//   describe('moveDeclarationNamed class decl', () => {
//     const projectPath = `assets/sampleProject1_3_copy`
//     it('moveDeclarationNamed', () => {
//       rm(`-rf`, projectPath)
//       cp(`-r`, `assets/sampleProject1`, `${projectPath}`)
//       project = new Project({
//         tsConfigFilePath: `${projectPath}/tsconfig.json`
//       });
//       moveDeclarationNamed(`Apple`, project.getSourceFile(resolve(`${projectPath}/src/model/apple.ts`)), project, project.getSourceFile(resolve(`${projectPath}/src/model/level2/usingApples.ts`)))
//     })
//     doAssert(projectPath)
//   })
// })

// function doAssert(projectPath: string) {

//   it(`target file should contain moved decl and and new imports referenced by it `, () => {
//     expect(cat(`${projectPath}/src/model/level2/usingApples.ts`).toString()).toContain(`export class Apple extends Fruit implements Eatable, Alive {`)
//     expect(cat(`${projectPath}/src/model/level2/usingApples.ts`).toString()).toContain(`import { Alive } from "../../model/Alive";`)
//     expect(cat(`${projectPath}/src/model/level2/usingApples.ts`).toString()).toContain(`import { Eatable } from "../../model/Eatable";`)
//     expect(cat(`${projectPath}/src/model/level2/usingApples.ts`).toString()).toContain(`import { Fruit } from "../../model/fruit";`)
//     expect(cat(`${projectPath}/src/model/level2/usingApples.ts`).toString()).toContain(`import { Seed } from "../seeds";`)
//   })

//   it(`target file should not contain old import to declaration`, () => {
//     expect(cat(`${projectPath}/src/model/level2/usingApples.ts`).toString()).not.toContain(`import { Apple }`)
//   })
  
//   it(`original file should not have the class nor imports related to it any more`, () => {
//     // apple.js shouldnt`t have  anymore and any import referencing c internals or imports related to C
//     expect(cat(`${projectPath}/src/model/apple.ts`).toString()).not.toContain(`export class Apple extends Fruit implements Eatable, Alive {`)
//     expect(cat(`${projectPath}/src/model/apple.ts`).toString()).not.toContain(`import { Fruit } from "./fruit";`)
//     expect(cat(`${projectPath}/src/model/apple.ts`).toString()).not.toContain(`import { Eatable } from "./Eatable";`)
//   })

//   it(`project should compile OK`, () => {
//     project.saveSync()
//     project.emit()
//     expect(project.getPreEmitDiagnostics().length).toBe(0)
//   })

//   it(`other files with references to class should change its imports accordingly`, () => {
//     expect(cat(`${projectPath}/src/tools.ts`).toString()).toContain(`import { a as a2, Apple } from "./model/level2/usingApples";`)
//   })
// }


// function getTopLevelClassNamed(project: Project, name: string): ClassDeclaration | undefined {
//   let classFound
//   project.getSourceFiles().some(p => {
//     classFound = p.getClass(name)
//     return !!classFound
//   })
//   return classFound
// }
