// import * as shell from 'shelljs';
// import { getDiagnosticsInCurrentLocation } from 'typescript-ast-util';
// import { Tool, create } from 'typescript-plugin-test-helper';

// jasmine.DEFAULT_TIMEOUT_INTERVAL = 99999999
// describe('using plugin test helper', () => {
//   const projectPath = `assets/sampleProject1_using_helper_copy`;
//   const log = function (msg) { }
//   let tool: Tool
//   beforeEach(() => {
//     shell.rm(`-rf`, projectPath);
//     shell.cp(`-r`, `assets/sampleProject1`, `${projectPath}`);
//     tool = create({
//       inputFiles: `${projectPath}/src/**/*.ts`,
//       currentDirectory: `${projectPath}`,
//       options: {
//         plugins: [{ name: 'typescript-plugin-proactive-code-fixes' }]
//       }
//     })
//   });

//   it('Declare variable fix', (done) => {
//     tool.on('emit', m => console.log('LOG: ' + m))
//     console.log(tool.getLanguageServiceHost().getCompilationSettings())
//     tool.on('emit-file-output', output => console.log('emit file ', output))
//     // tool.emitAllFiles()
//     tool.watch()
//     const program = tool.getLanguageService().getProgram()
//     program.emit()
//     const sourceFile = program.getSourceFiles().find(sf => sf.fileName.includes(`src/index.ts`));
//     const cursorPosition = 61
//     const refactors = tool.getLanguageService().getApplicableRefactors(sourceFile.fileName, 61)
//     const diags = getDiagnosticsInCurrentLocation(program, sourceFile, 61)
//     console.log({ refactors, diags });
//     done()
//   })
// })