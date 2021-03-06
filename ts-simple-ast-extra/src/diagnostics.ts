import { Diagnostic, DiagnosticMessageChain, Project } from 'ts-morph'

export function printDiagnostics(project: Project) {
  return project.getPreEmitDiagnostics().map(getDiagnosticMessage)
}

export function getDiagnosticMessage(d: Diagnostic) {
  const s = d.getMessageText()
  return `${d.getSourceFile() && d.getSourceFile()!.getBaseName()}: ${typeof s === 'string' ? s : (s.getNext() || []).map(print).join(' - ')}`
}

function print(s: DiagnosticMessageChain | undefined): string {
  if (!s) {
    return ''
  } else {
    return `${s.getMessageText()} - ${(s.getNext() || []).map(print).join(' - ')}`
  }
}
