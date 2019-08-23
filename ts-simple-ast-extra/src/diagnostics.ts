import { Diagnostic, DiagnosticMessageChain, Project } from 'ts-morph'

export function printDiagnostics(project: Project) {
  return project.getPreEmitDiagnostics().map(getDiagnosticMessage)
}

export function getDiagnosticMessage(d: Diagnostic) {
  const s = d.getMessageText()
  return `${d.getSourceFile() && d.getSourceFile()!.getBaseName()}: ${typeof s === 'string' ? s : print(s.getNext())}`
}

function print(s: DiagnosticMessageChain | undefined): string {
  if (!s) {
    return ''
  } else {
    return `${s.getMessageText()} - ${print(s.getNext())}`
  }
}

// export interface GetDiagnosticsOptions {
//   type: 'syntactical'|'semantical'
//   project:Project
// }
// export function getDiagnostics(o: GetDiagnosticsOptions){
//   return o.type==='semantical' ? o.project.getProgram().getSemanticDiagnostics() : 
// }


    // /**
    //  * Gets the pre-emit diagnostics.
    //  * @param sourceFile - Optional source file to filter the results by.
    //  */
    // getSyntacticDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
    //     const compilerDiagnostics = this.program.compilerObject.getSyntacticDiagnostics(sourceFile == null ? undefined : sourceFile.compilerNode);
    //     return compilerDiagnostics.map(d => this.compilerFactory.getDiagnostic(d));
    // }

    // /**
    //  * Gets the pre-emit diagnostics.
    //  * @param sourceFile - Optional source file to filter the results by.
    //  */
    // getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
    //     const compilerDiagnostics = this.program.compilerObject.getSemanticDiagnostics(sourceFile == null ? undefined : sourceFile.compilerNode);
    //     return compilerDiagnostics.map(d => this.compilerFactory.getDiagnostic(d));
    // }