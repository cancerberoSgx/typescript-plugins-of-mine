import { Project, SourceFile, UserPreferences } from 'ts-morph'
import { FormatCodeSettings, getDefaultFormatCodeSettings } from 'typescript'
import { addTrailingSemicolons, removeTrailingSemicolons } from './trailingSemicolons'
import { quotes, QuotesOptions } from './quotes';

export interface RefactorFormatBaseOptions extends Partial<FormatCodeSettings> {
  file: SourceFile
  project: Project
}

export interface FormatOptions extends QuotesOptions {

}

export function format(options: FormatOptions) {
  options = Object.assign({}, getDefaultFormatCodeSettings(options.newLineCharacter || '\n'), options)
  if (options.trailingSemicolons === 'never') {
    removeTrailingSemicolons(options.file)
  } else if (options.trailingSemicolons === 'always') {
    addTrailingSemicolons(options.file)
  }
  if (options.quotePreference ) {
    quotes(options as FormatOptions&{quotePreference: }>)
  }
  const edits = options.project
    .getLanguageService()
    .getFormattingEditsForDocument(options.file.getSourceFile().getFilePath(), options)
  const file = options.file.getSourceFile().applyTextChanges(edits || [])
  return file
}
