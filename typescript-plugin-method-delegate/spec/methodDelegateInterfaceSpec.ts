import { rm, cp, cat } from "shelljs";
import Project, { SourceFile } from "ts-simple-ast";
import { methodDelegateOnInterface, methodDelegateOnClass } from "../src/methodDelegate";

let project:Project
describe('method delegate interface', () => {
  const projectPath = `assets/sampleProject1_1_copy`
  it(`interfaces`, () => {
    rm(`-rf`, projectPath)
    cp(`-r`, `assets/sampleProject1`, `${projectPath}`)
    project = new Project({
      tsConfigFilePath: `${projectPath}/tsconfig.json`
    });

    project.saveSync()
    project.emit()
    expect(project.getDiagnostics().length).toBe(0)
    
    const targetSourceFile:SourceFile = project.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`))
    methodDelegateOnInterface(targetSourceFile.getInterface('Car'), 'speedometer')

    methodDelegateOnClass(targetSourceFile.getClass('Foo'), 'speedometer')
    project.saveSync()
    project.emit()
  })
  doAssert(projectPath)
})


function doAssert(projectPath: string) {

  it('interface should contain delegate method signatures', ()=> {
    expect(cat(`${projectPath}/src/index.ts`).toString()).toContain('getCurrentSpeed(): number;')
    expect(cat(`${projectPath}/src/index.ts`).toString()).toContain('rotate(force: number): {counterclockwise:boolean, h:number};')
    expect(cat(`${projectPath}/src/index.ts`).toString()).toContain('m(): number;')
    expect(cat(`${projectPath}/src/index.ts`).toString()).toContain('go(to: {x:number,y:number}): Promise<void>;')
    expect(cat(`${projectPath}/src/index.ts`).toString().split('getCurrentSpeed():').length).toBe(4)
    expect(cat(`${projectPath}/src/index.ts`).toString().split('@return un numero number importante').length).toBe(4) // jsdoc is preserved
  })
  it(`project should compile OK`, () => {
    project.saveSync()
    project.emit()
    expect(project.getDiagnostics().length).toBe(0)
    // console.log(project.getDiagnostics().map(d=>d.getMessageText()).join('\n'))
  })

}
