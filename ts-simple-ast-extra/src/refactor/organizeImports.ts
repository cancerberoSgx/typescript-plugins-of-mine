import { UserPreferences } from 'ts-morph'
import { RefactorFormatBaseOptions } from './format'

export interface OrganizeImportsOptions extends RefactorFormatBaseOptions, Partial<UserPreferences> {
  organizeImports?: boolean
  // /**
  //  * The refactor always return a new file identical to given with imports organized. By default also apply these changes to given file unless this flag is true.
  //  */
  // noModify?: boolean
}

export function organizeImports(options: OrganizeImportsOptions) {
  if (!options.organizeImports) {
    return
  }
  const file = options.file.organizeImports(options, options)
  // if (!options.noModify) {
    options.file.replaceWithText(file.getFullText())
  // }
  return file
}
