import Project, { Diagnostic, DiagnosticMessageChain, SourceFile, ScriptTarget } from 'ts-morph'

export function createProject(...args: string[] | string[][]) {
  const project = new Project()
  const files = (args as any[])
    .map((a, i) => {
      return typeof a === 'string'
        ? { content: a, file: `f${i + 1}.ts` }
        : ({ content: a[1], file: a[0] } as { content: string; file: string })
    })
    .map(f => project.createSourceFile(f.file, f.content))
  expectNoErrors(project)
  const fileMap: { f1: SourceFile; f2: SourceFile; f3: SourceFile; f4: SourceFile } = {} as any
  files.forEach((f, i) => {
    ;(fileMap as any)[`f${i + 1}`] = f
  })
  return { project, ...fileMap }
}

export function expectNoErrors(project: Project) {
  expect(
    project
      .getPreEmitDiagnostics()
      .map(d => getDiagnosticMessage(d))
      .join(', ')
  ).toBe('')
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
