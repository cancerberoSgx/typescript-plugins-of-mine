import { UserPreferences } from 'ts-morph'
import { RefactorFormatBaseOptions } from './format'

export interface OrganizeImportsOptions extends RefactorFormatBaseOptions, Partial<UserPreferences> {
  organizeImports?: boolean
}

export function organizeImports(options: OrganizeImportsOptions) {
  if (!options.organizeImports) {
    return
  }
  const file = options.file.organizeImports(options, options)
  options.file.replaceWithText(file.getFullText())
  return file
}
