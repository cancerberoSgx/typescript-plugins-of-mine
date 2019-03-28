import {
  IndentationText,
  QuoteKind,
  ManipulationSettings,
  NewLineKind,
  UserPreferences,
  FormatCodeSettings
} from 'ts-morph'

export function buildManipulationSettings(
  formatOptions?: FormatCodeSettings,
  userPreferences?: UserPreferences
): ManipulationSettings {
  let indentationText: IndentationText = IndentationText.TwoSpaces
  if (formatOptions) {
    if (!formatOptions.convertTabsToSpaces) {
      indentationText = IndentationText.Tab
    } else if (formatOptions.tabSize === 4) {
      indentationText = IndentationText.FourSpaces
    } else if (formatOptions.tabSize === 8) {
      indentationText = IndentationText.EightSpaces
    }
  }
  const obj: ManipulationSettings = {
    indentationText,
    newLineKind: !formatOptions
      ? NewLineKind.LineFeed
      : formatOptions.newLineCharacter === '\n'
      ? NewLineKind.LineFeed
      : NewLineKind.CarriageReturnLineFeed,
    quoteKind: userPreferences && userPreferences.quotePreference === 'double' ? QuoteKind.Double : QuoteKind.Single,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces:
      !!formatOptions && !!formatOptions.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces
  }
  return obj
}
