
import Project, {SourceFile, Node, Diagnostic, TypeGuards} from 'ts-simple-ast'
import * as ts from 'typescript'
import {getDiagnosticsInCurrentLocation} from 'typescript-ast-util'
import {create, Tool} from  'typescript-plugin-test-helper'


const projectPath = `.`;
const tool = create({
  inputFiles: `${projectPath}/src/**/*.ts`, 
  currentDirectory: `${projectPath}`,
  options: {
    plugins: [{name: 'typescript-plugin-proactive-code-fixes'}]
  }
})
tool.on('emit', m=>console.log('LOG: '+m))
console.log(   tool.getLanguageServiceHost().getCompilationSettings())
tool.on('emit-file-output', output=>console.log('emit file ', output))
// tool.emitAllFiles()
tool.watch()
const program = tool.getLanguageService().getProgram()
program.emit()
const sourceFile = program.getSourceFiles().find(sf => sf.fileName.includes(`src/index.ts`));
const cursorPosition = 61
const refactors = tool.getLanguageService().getApplicableRefactors(sourceFile.fileName, 61)
const diags = getDiagnosticsInCurrentLocation(program, sourceFile, 61)
console.log({refactors, diags});
