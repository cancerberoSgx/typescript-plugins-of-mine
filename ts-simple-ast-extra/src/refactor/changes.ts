import { ts, Project, TextChange, SourceFile, Node } from 'ts-morph'
import { notUndefined } from 'misc-utils-of-mine-typescript'
import { flatReadOnly } from 'misc-utils-of-mine-generic'

export function createTextChanges(textChanges: ts.TextChange[]): TextChange[] {
  return textChanges.map(compilerNode => {
    return new (TextChange as any)(compilerNode) // Hack because this constructor in internal
  })
}

export function applyTextChanges(code: string, textChanges: ts.TextChange[]): string {
  const simpleTextChanges = createTextChanges(textChanges)
  const sourceFile = applyTextChangesGetSourceFile()
  sourceFile.replaceWithText(code)
  sourceFile.applyTextChanges(simpleTextChanges)
  return sourceFile.getText()
}

export interface ApplyFileTextChangesResult {
  modified: SourceFile[]
  removed: SourceFile[]
  created: SourceFile[]
}

export function applyFileTextChanges(
  project: Project,
  ftc: ts.FileTextChanges,
  removeEmpty: boolean = false,
  result: ApplyFileTextChangesResult = {
    modified: [],
    removed: [],
    created: []
  }
): ApplyFileTextChangesResult {
  let file = project.getSourceFile(ftc.fileName)
  if (ftc.isNewFile && file) {
    throw new Error(
      'FileTextChanges instructed to create file ' + file + ' but it already exists on the project. Aborting!'
    )
  }
  if (!file && !ftc.isNewFile) {
    throw new Error(
      'FileTextChanges instructed to modify existing file ' +
        file +
        " but it doesn't exist. Refusing to create it. Aborting!"
    )
  }
  let created
  if (!file) {
    file = project.createSourceFile(ftc.fileName)
    result.created.push(file)
    created = true
  }
  file.applyTextChanges(createTextChanges(ftc.textChanges))
  if (!file.getText().trim() && removeEmpty) {
    project.removeSourceFile(file)
    result.removed.push(file)
  } else if (!created) {
    result.modified.push(file)
  }
  return result
}

export function applyRefactorEditInfo(
  project: Project,
  refactor: ts.RefactorEditInfo,
  removeEmpty: boolean = false,
  result: ApplyFileTextChangesResult = {
    modified: [],
    removed: [],
    created: []
  }
): ApplyFileTextChangesResult {
  refactor.edits.forEach(edits => {
    applyFileTextChanges(project, edits, removeEmpty, result)
  })
  return result
}
/**
 * Apply suggested code fixes like the ones returned by (`LanguageService#getSuggestionDiagnostics()`) to given `containerNode`.
 * Code fixes are given in `codes` or if not provided, all language service suggestions will be applied.
 *
 * @param containerNode the node inside which to apply code fixes.
 * @param codes code fixes codes to apply. If not provided all language service suggestions code fixes that apply to
 * `containerNode` will be applied.
 */
export function applyAllSuggestedCodeFixes(
  project: Project,
  containerNode: Node,
  codes?: number[],
  removeEmpty: boolean = false
) {
  //TODO: also there could be refactors that are not being suggested like convert import - investigate
  const result: ApplyFileTextChangesResult = {
    modified: [],
    removed: [],
    created: []
  }
  let fixes = getSuggestedCodeFixesInside(project, containerNode, codes)
  while (fixes && fixes.length) {
    applyFileTextChanges(project, fixes[0].changes[0], removeEmpty, result)
    fixes = getSuggestedCodeFixesInside(project, containerNode, codes) // TODO: performance we only need the first one. Also use combined CodeFix to apply several at once increases performance
  }
  return result
}

export function getSuggestedCodeFixesInside(
  project: Project,
  containerNode: Node,
  codes?: number[]
): ReadonlyArray<ts.CodeFixAction> | undefined {
  const service = project.getLanguageService().compilerObject
  const diagnostics = service
    .getSuggestionDiagnostics(containerNode.getSourceFile().getFilePath())
    .map(d => {
      if (
        d.start >= containerNode.getFullStart() &&
        d.start + d.length <= containerNode.getEnd() &&
        (!codes || codes.includes(d.code))
      ) {
        return service.getCodeFixesAtPosition(
          containerNode.getSourceFile().getFilePath(),
          d.start,
          d.start + d.length,
          [d.code],
          {},
          {}
        )
      }
    })
    .filter(a => a && a.length)
  return flatReadOnly(diagnostics.filter(notUndefined))
}

let applyTextChangesSourceFile: SourceFile

function applyTextChangesGetSourceFile() {
  if (!applyTextChangesSourceFile) {
    const project = new Project({ useVirtualFileSystem: true })
    applyTextChangesSourceFile = project.createSourceFile('tmp.ts', '')
  }
  return applyTextChangesSourceFile
}
