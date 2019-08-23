import { RemoveProperties, checkThrow } from 'misc-utils-of-mine-generic'
import { Project, SourceFile } from 'ts-morph'
import { FormatCodeSettings, getDefaultFormatCodeSettings, DiagnosticCategory } from 'typescript'
import { organizeImports, OrganizeImportsOptions } from './organizeImports'
import { quotes, QuotesOptions } from './quotes'
import { trailingSemicolons, TrailingSemicolonsOptions } from './trailingSemicolons'
import { EmptyLinesOptions, emptyLines } from './emptyLines';
import { getDiagnosticMessage, printDiagnostics } from '../diagnostics';

export interface RefactorInputOptions {
  file: SourceFile
  project: Project
}

export interface RefactorBaseOptions {
  verifyErrors?: 'all' | 'syntactical' | 'semantical'
}

export interface RefactorFormatBaseOptions extends Partial<FormatCodeSettings>, RefactorInputOptions {

}

export interface FormatOptions extends RefactorBaseOptions, RefactorFormatBaseOptions, QuotesOptions, TrailingSemicolonsOptions,
  RemoveProperties<OrganizeImportsOptions, 'quotePreference'>, EmptyLinesOptions {

}

export function format(options: FormatOptions) {
  options = Object.assign({}, getDefaultFormatCodeSettings(options.newLineCharacter || '\n'), options)
  if (options.verifyErrors) {
    const d = options.verifyErrors==='all' ? options.project.getPreEmitDiagnostics() : options.verifyErrors==='semantical' ?  options.project.getProgram().getSemanticDiagnostics() : options.verifyErrors==='syntactical' ?  options.project.getProgram().getSyntacticDiagnostics() : [] 
    checkThrow(d.length === 0, `TypeScript errors found and verifyErrors === '${options.verifyErrors}' was used. Aborting. \nErrors:\n * ${d.map(getDiagnosticMessage).join('\n * ')}`)
  }
  let file = organizeImports(options) // Important: this first since TS won't respect formatSettings and do "heuristics"
  trailingSemicolons(options)
  quotes(options)
  emptyLines(options)
  const edits = options.project
    .getLanguageService()
    .getFormattingEditsForDocument(options.file.getSourceFile().getFilePath(), options)
  file = options.file.getSourceFile().applyTextChanges(edits || [])
  return file
}

interface FormatBaseNoInput extends RemoveProperties<FormatOptions, keyof RefactorInputOptions> {

}

export interface FormatStringOptions extends FormatBaseNoInput {
  code: string
}

export function formatString(options: FormatStringOptions): string {
  const project = new Project()
  const file = project.createSourceFile('f1.ts', options.code)
  const output = format({ ...options, file, project })
  return output.getFullText()
}
