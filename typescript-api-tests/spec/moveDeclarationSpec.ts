// import { cat, cp, rm } from "shelljs";
// import Project, { ClassDeclaration } from "ts-simple-ast";
// import { moveDeclaration } from "../src/moveDeclaration";

// let project 
// describe('move declaration', () => {

//   it('perform refactor on sample project moving src/model/Apple:Apple to file src/model/level2/usingApples', () => {
//     rm('-rf', 'assets/sampleProject1_copy')
//     cp('-r', 'assets/sampleProject1', 'assets/sampleProject1_copy')
//     project = new Project({
//       tsConfigFilePath: "assets/sampleProject1_copy/tsconfig.json"
//     });
//     const apple = getTopLevelClassNamed(project, 'Apple')
//     const targetSourceFile = project.getSourceFiles().find(sf => sf.getFilePath().includes('usingApples.ts'))
//     if(apple&&targetSourceFile){
//       moveDeclaration(apple, project, targetSourceFile)
//     }
//   })

//   it('target file should contain class and new imports related to its decl', () => {
//     expect(cat('assets/sampleProject1_copy/src/model/level2/usingApples.ts').toString()).toContain('export class Apple extends Fruit implements Eatable, Alive {')
//     // TODO: new imports
//   })

//   it('target file should not contain old import to declaration', () => {
//     expect(cat('assets/sampleProject1_copy/src/model/level2/usingApples.ts').toString()).not.toContain('import { Apple }')
//   })
//   it('original file should not have the class nor imports related to it any more', () => {
//     // apple.js shouldn't have  anymore and any import referencing c internals or imports related to C
//     expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('export class Apple extends Fruit implements Eatable, Alive {')
//     expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('import { Fruit } from "./fruit";')
//     expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('import { Eatable } from "./Eatable";')


//   })
//   xit('because original file keeps referencing the declaration, it has a new improt to it', () => {
//     // apple.js shouldn't have  anymore and any import referencing c internals or imports related to C
//     expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('import { Apple } from "./level2/usingApples"')
//     expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('apples: Apple[]')
//   })


//   xit('project should compile OK', () => {
//     project.saveSync()
//     project.emit()
//     expect(project.getDiagnostics().length).toBe(0)
//   })

//   it('other files wiht references to class should change its imports accordingly', () => {

//     expect(cat('assets/sampleProject1_copy/src/tools.ts').toString()).toContain('import { Apple, a as a2 } from "./model/level2/usingApples";')
//   })

// })



// function getTopLevelClassNamed(project: Project, name: string): ClassDeclaration|undefined {
//   let classFound
//   project.getSourceFiles().some(p => {
//     classFound = p.getClass(name)
//     return !!classFound
//   })
//   return classFound
// }

