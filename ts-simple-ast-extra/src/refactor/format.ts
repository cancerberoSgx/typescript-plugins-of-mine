import detectIndent from 'detect-indent'
import { checkThrow, detectNewline, RemoveProperties } from 'misc-utils-of-mine-generic'
import { FormatCodeSettings, IndentationText, Project, SourceFile, ts } from 'ts-morph'
import { getDiagnosticMessage } from '../diagnostics'
import { emptyLines, EmptyLinesOptions } from './emptyLines'
import { formatJsdocs, FormatJsdocsOptions } from './formatJsdocs'
import { organizeImports, OrganizeImportsOptions } from './organizeImports'
import { quotes, QuotesOptions } from './quotes'
import { trailingSemicolons, TrailingSemicolonsOptions } from './trailingSemicolons'

export interface RefactorInputOptions {
  file: SourceFile
  project: Project
}

export interface RefactorBaseOptions {
  verifyErrors?: 'all' | 'syntactical' | 'semantical'
}

export interface RefactorFormatBaseOptions extends FormatCodeSettings, RefactorInputOptions {
  _projectManipulationSetted?: boolean
}

export interface FormatOptions extends RefactorBaseOptions, RefactorFormatBaseOptions, QuotesOptions, TrailingSemicolonsOptions,
  RemoveProperties<OrganizeImportsOptions, 'quotePreference'>, EmptyLinesOptions, FormatJsdocsOptions {

}

export function format(options: FormatOptions) {
  options = Object.assign({}, ts.getDefaultFormatCodeSettings(options.newLineCharacter || detectNewline(options.file.getFullText()) || '\n'), options)
  if (options.verifyErrors) {
    const d = options.verifyErrors === 'all' ? options.project.getPreEmitDiagnostics() : options.verifyErrors === 'semantical' ? options.project.getProgram().getSemanticDiagnostics() : options.verifyErrors === 'syntactical' ? options.project.getProgram().getSyntacticDiagnostics() : []
    checkThrow(d.length === 0, `TypeScript errors found and verifyErrors === '${options.verifyErrors}' was used. Aborting. \nErrors:\n * ${d.map(getDiagnosticMessage).join('\n * ')}`)
  }
  setupProjectManipulationSettings(options)
  emptyLines(options)
  formatJsdocs(options)
  organizeImports(options) // Important: this first since TS won't respect formatSettings and do "heuristics"
  trailingSemicolons(options)
  quotes(options)
  formatOnly(options)
  return options.file
}

interface FormatBaseNoInput extends RemoveProperties<FormatOptions, keyof RefactorInputOptions> {

}

export interface FormatStringOptions extends FormatBaseNoInput {
  code: string
}

export function setupProjectManipulationSettings(options: FormatOptions) {
  const indent = detectIndent(options.file.getFullText())
  options.indentSize = typeof options.indentSize === 'undefined' ? indent.amount : options.indentSize
  options.convertTabsToSpaces = (typeof options.convertTabsToSpaces === 'undefined' && indent.type === 'space') ? true : options.convertTabsToSpaces
  options.project.manipulationSettings.set({ indentationText: (indent.type === 'space' || options.convertTabsToSpaces) ? ((options.indentSize || indent.amount) === 2 ? IndentationText.TwoSpaces : (options.indentSize || indent.amount) === 4 ? IndentationText.FourSpaces : (options.indentSize || indent.amount) === 8 ? IndentationText.EightSpaces : IndentationText.TwoSpaces) : IndentationText.Tab })
  Object.assign(options, { _projectManipulationSetted: true } as RefactorFormatBaseOptions)
}

export function formatOnly(options: RefactorFormatBaseOptions) {
  const edits = options.project
    .getLanguageService()
    .getFormattingEditsForDocument(options.file.getFilePath(), options)
  options.file.applyTextChanges(edits || [])
}

export function formatString(options: FormatStringOptions): string {
  const project = new Project()
  const file = project.createSourceFile('f1.ts', options.code)
  const output = format({ ...options, file, project })
  return output.getFullText()
}
