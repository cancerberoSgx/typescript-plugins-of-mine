import { RemoveProperties } from 'misc-utils-of-mine-generic'
import { Project, SourceFile } from 'ts-morph'
import { FormatCodeSettings, getDefaultFormatCodeSettings } from 'typescript'
import { organizeImports, OrganizeImportsOptions } from './organizeImports'
import { quotes, QuotesOptions } from './quotes'
import { trailingSemicolons, TrailingSemicolonsOptions } from './trailingSemicolons'

export interface RefactorFormatBaseOptions extends Partial<FormatCodeSettings> {
  file: SourceFile
  project: Project
}

export interface FormatOptions
  extends RefactorFormatBaseOptions,
  QuotesOptions,
  TrailingSemicolonsOptions,
  RemoveProperties<OrganizeImportsOptions, 'quotePreference'> { }

export function format(options: FormatOptions) {
  options = Object.assign({}, getDefaultFormatCodeSettings(options.newLineCharacter || '\n'), options)

  let file = organizeImports(options) // Important: this first since TS won't respect formatSettings and do "heuristics"
  options = { ...options, file: file || options.file } // regenerate options since it forgets ts-morph nodes.
  trailingSemicolons(options)
  quotes(options)

  const edits = options.project
    .getLanguageService()
    .getFormattingEditsForDocument(options.file.getSourceFile().getFilePath(), options)
  file = options.file.getSourceFile().applyTextChanges(edits || [])
  return file
}
