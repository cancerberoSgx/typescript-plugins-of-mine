import { Project, SourceFile } from 'ts-morph'
import { diffLines } from 'diff'
import { printDiagnostics } from '../src/diagnostics';

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

let project: Project | undefined
let file: SourceFile | undefined

export function getFile(code: string) {
  if (!file) {
    project = new Project({})
    file = project.createSourceFile('foo.ts', code)
  } else if (code) {
    file = file.replaceWithText(code) as SourceFile
  }
  return file!
}

export function expectNoErrors(project: Project) {
  expect(
    printDiagnostics(project)
      .join('\n')
  ).toBe('')
}

require('colors')
export function expectEqualsAndDiff(a: string, b: string) {
  const d = diffLines(a, b)
  const diff = d.filter(part => part.added || part.removed)
  if (diff.length) {
    d.forEach(part => {
      var color = part.added ? 'green' : part.removed ? 'red' : 'grey'
      process.stderr.write(part.value.replace(/[ \t]/g, '·')[color as any])
    })
  }
  expect(diff.length).toEqual(0, 'Strings Different')
}
