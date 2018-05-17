import { cat, cp, rm } from "shelljs";
import Project, { ClassDeclaration } from "ts-simple-ast";
import { moveClass } from "../src/moveDeclaration";

describe('playing with ts-simple-ast', () => {

  it('do it', () => {
    rm('-rf', 'assets/sampleProject1_copy')
    cp('-r', 'assets/sampleProject1', 'assets/sampleProject1_copy')
    const project = new Project({
      tsConfigFilePath: "assets/sampleProject1_copy/tsconfig.json"
    });
    const apple = getTopLevelClassNamed(project, 'Apple')
    moveClass(apple, project, project.getSourceFiles().find(sf => sf.getFilePath().includes('usingApples.ts')))
  })

  it('target file should contain class and new imports related to its decl', () => {
    expect(cat('assets/sampleProject1_copy/src/model/level2/usingApples.ts').toString()).toContain('export class Apple extends Fruit implements Eatable, Alive {')
    // TODO: new imports

  })
  it('original file should not have the class nor imports relate to it any more', () => {

    // apple.js shouldn't have  anymore and any import referencing c internals or imports related to C
    expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('export class Apple extends Fruit implements Eatable, Alive {')
    expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('import { Fruit } from "./fruit";')
    expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('import { Eatable } from "./Eatable";')
    expect(cat('assets/sampleProject1_copy/src/model/apple.ts').toString()).not.toContain('import { Alive } from "./Alive";')


  })

  xit('project should compile OK', () => {

    // TODO: expect project compiles OK dont have diagnostic warnings
  })

  it('other files wiht references to class should change its imports accordingly', () => {

    expect(cat('assets/sampleProject1_copy/src/tools.ts').toString()).toContain('import { Apple, a as a2 } from "./model/level2/usingApples";')
  })
})



function getTopLevelClassNamed(project: Project, name: string): ClassDeclaration {
  let classFound
  project.getSourceFiles().some(p => {
    classFound = p.getClass(name)
    if (classFound) {
      return true
    }
  })
  return classFound
}

