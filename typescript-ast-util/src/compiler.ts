import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import * as ts from 'typescript';


// compilation

export function compileFile(fileName: string = '', tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath).toString())
  if (tsConfigJson.error) {
    throw tsConfigJson.error
  }
  let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, dirname(tsconfigPath))
  if (errors.length) {
    throw errors
  }
  const compilerHost: ts.CompilerHost = {
    ...ts.createCompilerHost(options),
    getSourceFile: (fileName, languageVersion) => ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
  }
  const program = ts.createProgram([fileName], options, compilerHost);
  ts.formatDiagnosticsWithColorAndContext(program.getSyntacticDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getDeclarationDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getGlobalDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getSemanticDiagnostics(), compilerHost)
  return program
}

export function compileProject(projectFolder: string, rootFiles: Array<string> = [], tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(tsconfigPath, readFileSync(tsconfigPath).toString())
  if (tsConfigJson.error) {
    throw tsConfigJson.error
  }
  const compilerOptions = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, projectFolder, tsconfigPath)
  if (compilerOptions.errors.length) {
    throw compilerOptions.errors
  }
  const compilerHost: ts.CompilerHost = {
    ...ts.createCompilerHost(compilerOptions.options),
    getSourceFile: (fileName, languageVersion) => ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
  }
  const program = ts.createProgram(rootFiles, compilerOptions.options, compilerHost);

  ts.formatDiagnosticsWithColorAndContext(program.getSyntacticDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getDeclarationDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getGlobalDiagnostics(), compilerHost)
  ts.formatDiagnosticsWithColorAndContext(program.getSemanticDiagnostics(), compilerHost)
  return program

}

/**
 * 
 * @param files useful for creating in-memory programs for testing or using APIs without having to access FS
 * @param compilerOptions 
 */
export function createProgram(files: { fileName: string, content: string, sourceFile?: ts.SourceFile }[], compilerOptions?: ts.CompilerOptions): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson('tsconfig.json', compilerOptions ? JSON.stringify(compilerOptions) : `{
    "compilerOptions": {
      "target": "es2018",   
      "module": "commonjs", 
      "lib": ["es2018"],
      "rootDir": ".",
      "strict": false,   
      "esModuleInterop": true,
    }
  }`)
  let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, '.')
  if (errors.length) {
    throw errors
  }
  const compilerHost = ts.createCompilerHost(options)
  compilerHost.getSourceFile = function (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile | undefined {
    const file = files.find(f => f.fileName === fileName)
    if (!file) { return undefined }
    file.sourceFile = file.sourceFile || ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES2015, true)
    return file.sourceFile
  }
  return ts.createProgram(files.map(f => f.fileName), options, compilerHost)
}


/** return program diagnostics on given sourcefile that contain given position */
export function getDiagnosticsInCurrentLocation(program: ts.Program, sourceFile: ts.SourceFile, position: number | ts.TextRange): ts.Diagnostic[] {
  const range: ts.TextRange = (position as ts.TextRange).pos ? (position as ts.TextRange) : { pos: (position as number), end: (position as number) }
  const diagnostics = [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getDeclarationDiagnostics()
  ];
  return position === -1 ? diagnostics : diagnostics.filter(d => d.start <= range.pos && range.end <= d.start + d.length && d.file.fileName === sourceFile.fileName);
}

