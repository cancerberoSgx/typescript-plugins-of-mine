// import { cp, rm } from "shelljs";
// import Project, { SourceFile } from "ts-simple-ast";

// describe('lets see how ts-simple-ast move file / folder to other location behaves without doing anything else', () => {

//   it('perform refactor on sample project moving src/model/Apple:Apple to file src/model/level2/usingApples', () => {
//     rm('-rf', 'assets/sampleProject1_2_copy')
//     cp('-r', 'assets/sampleProject1', 'assets/sampleProject1_2_copy')
//     const project = new Project({
//       tsConfigFilePath: "assets/sampleProject1_2_copy/tsconfig.json"
//     });
//     project.emit()
//     expect(project.getPreEmitDiagnostics().length).toBe(0)
//     const fileToMove = project.getSourceFiles().find(sf => sf.getFilePath().includes('apple.ts'))
//     if (!fileToMove) {
//       return fail()
//     }
//     fileToMove.move('level2/pepito.ts')
//     project.saveSync()
//     project.emit()
//     expect(project.getPreEmitDiagnostics().length).toBe(0)

//     const different = project.createDirectory('assets/sampleProject1_2_copy/src/model/different')
//     project.getDirectories().find(d => d.getPath().includes('src/model/level2')).move(different.getPath())

//     project.saveSync()
//     project.emit()
//     expect(project.getPreEmitDiagnostics().length).toBe(0)
//   })

// })

// function moveFileWithSimpleAst(project: Project, file: SourceFile, newLocation: string) {
//   file.move(newLocation)
//   project.saveSync()
// }
