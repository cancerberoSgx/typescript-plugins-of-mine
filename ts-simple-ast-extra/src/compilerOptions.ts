import {
  CompilerOptions,
  FormatCodeSettings,
  IndentationText,
  ManipulationSettings,
  NewLineKind,
  QuoteKind,
  ts,
  UserPreferences
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
    usePrefixAndSuffixTextForRename: false,
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

export function parseCompilerOptionsFromText(tsConfigData: string, basePath = './') {
  let compilerOptions: CompilerOptions | undefined
  const jsConfigJson = ts.parseConfigFileTextToJson(basePath, tsConfigData)
  if (jsConfigJson.error) {
    throw `parseCompilerOptionsFromText jsConfigJson.error 1: ${jsConfigJson.error.messageText}`
  }
  const tsConfigJson = ts.parseConfigFileTextToJson(basePath, tsConfigData)
  if (tsConfigJson.error) {
    throw `parseCompilerOptionsFromText tsConfigJson.error 2 :${jsConfigJson.error!.messageText}`
  }
  let r = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, basePath)
  if (r.errors.length) {
    throw `parseCompilerOptionsFromText r.errors.length: ${r.errors.map(e => e.messageText)}`
  }
  compilerOptions = r.options
  return compilerOptions
}
