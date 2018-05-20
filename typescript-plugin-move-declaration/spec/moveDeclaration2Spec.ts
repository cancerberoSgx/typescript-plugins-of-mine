import { cat, cp, rm } from "shelljs";
import Project, { ClassDeclaration } from "ts-simple-ast";
import { moveDeclaration, moveDeclarationNamed } from "../src/moveDeclaration";
import { resolve } from "path";

let project

describe(`move class declaration`, () => {
  describe('moveDeclarationNamed class decl 2nd example', () => {
    const projectPath = `assets/sampleProject2_copy`
    it('moveDeclarationNamed', () => {
      rm(`-rf`, projectPath)
      cp(`-r`, `assets/sampleProject2`, `${projectPath}`)
      project = new Project({
        tsConfigFilePath: `${projectPath}/tsconfig.json`
      });
      moveDeclarationNamed(`Unit`, project.getSourceFile(resolve(`${projectPath}/src/model/units/Unit.ts`)), project, project.getSourceFile(resolve(`${projectPath}/src/model/base/impl/ThingImpl.ts`)))
    })
    doAssert(projectPath)
  })
})


function doAssert(projectPath: string) {

  it(`target file should contain moved decl and and new imports referenced by it `, () => {
    expect(cat(`${projectPath}/src/model/base/impl/ThingImpl.ts`).toString()).toContain(`export interface Unit extends Thing {`)
    expect(cat(`${projectPath}/src/model/base/impl/ThingImpl.ts`).toString()).toContain(`import { Thing } from "../Thing";`)
  })

  it(`files using the decl should have import updated`, () => {
    expect(cat(`${projectPath}/src/model/base/impl/ThingImpl.ts`).toString()).toContain(`export interface Unit extends Thing {`)
    expect(cat(`${projectPath}/src/model/units/impl/Knight.ts`).toString()).toContain(`import { Unit } from "../../base/impl/ThingImpl";`)
  })

  it(`original file should not have the class nor imports related to it any more`, () => {
    expect(cat(`${projectPath}/src/model/units/Unit.ts`).toString()).not.toContain(`export interface Unit extends Thing {`)
    expect(cat(`${projectPath}/src/model/units/Unit.ts`).toString()).not.toContain(`import { Thing } from "../base/Thing";`)
  })

  xit(`project should compile OK`, () => {
    project.saveSync()
    project.emit()
    expect(project.getDiagnostics().length).toBe(0)
  })

}

