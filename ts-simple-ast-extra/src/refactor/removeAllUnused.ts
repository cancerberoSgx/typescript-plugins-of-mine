import { FormatCodeSettings, Project, SourceFile, UserPreferences } from 'ts-morph'

export function removeAllUnused(
  project: Project,
  sourceFileOrPath: SourceFile | string,
  formatSettings: FormatCodeSettings = {},
  userPreferences: UserPreferences = {}
) {
  const file = typeof sourceFileOrPath === 'string' ? project.getSourceFileOrThrow(sourceFileOrPath) : sourceFileOrPath
  const fix = project
    .getLanguageService()
    .getCombinedCodeFix(file, 'unusedIdentifier_delete', formatSettings, userPreferences)
  fix.getChanges().forEach(c => c.applyChanges({ overwrite: true }))
}
