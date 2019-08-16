import { Project, SourceFile } from 'ts-morph';
import { FormatCodeSettings, getDefaultFormatCodeSettings } from 'typescript';
import { addTrailingSemicolons, removeTrailingSemicolons } from './trailingSemicolons';

interface Options extends Partial<FormatCodeSettings> {
  file: SourceFile
  project: Project
  trailingSemicolons?: 'never' | 'always'
  newLineCharacter?: string
}

export function format(options: Options) {
  options = Object.assign({}, getDefaultFormatCodeSettings(options.newLineCharacter || '\n'), options)
  if (options.trailingSemicolons === 'never') {
    removeTrailingSemicolons(options.file)
  } else if (options.trailingSemicolons === 'always') {
    addTrailingSemicolons(options.file)
  }
  const edits = options.project
    .getLanguageService()
    .getFormattingEditsForDocument(options.file.getSourceFile().getFilePath(), options)
  const file = options.file.getSourceFile().applyTextChanges(edits || [])
  return file
}
