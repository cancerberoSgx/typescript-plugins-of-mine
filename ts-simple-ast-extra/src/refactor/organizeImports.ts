// import { Project, SourceFile, UserPreferences } from 'ts-morph'
// import { FormatCodeSettings, getDefaultFormatCodeSettings } from 'typescript'
// import { addTrailingSemicolons, removeTrailingSemicolons } from './trailingSemicolons'

// export interface OrganizeImportsOptions extends Partial<FormatCodeSettings> , Partial<UserPreferences> {
//   file: SourceFile
//   project: Project
//   trailingSemicolons?: 'never' | 'always'
// }

// export function organizeImports(options: OrganizeImportsOptions) {
//   options = Object.assign({}, getDefaultFormatCodeSettings(options.newLineCharacter || '\n'), options)
//   if (options.trailingSemicolons === 'never') {
//     removeTrailingSemicolons(options.file)
//   } else if (options.trailingSemicolons === 'always') {
//     addTrailingSemicolons(options.file)
//   }
//   const edits = options.project
//     .getLanguageService()
//     .organizeImports(options.file.getSourceFile().getFilePath(), options)
//   const file = options.file.getSourceFile().applyTextChanges(edits || [])
//   return file
// }
