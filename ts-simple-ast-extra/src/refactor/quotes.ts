import { NoSubstitutionTemplateLiteral, StringLiteral, TypeGuards, UserPreferences } from 'ts-morph'
import { RefactorFormatBaseOptions } from './format'

export interface QuotesOptions extends RefactorFormatBaseOptions {
  quotePreference?: Quote
}

type Quote = UserPreferences['quotePreference']
type Quotable = StringLiteral | NoSubstitutionTemplateLiteral
type QuoteChar = '"' | "'"

export function quotes(options: QuotesOptions) {
  if (!options.quotePreference) {
    return
  }
  var q = options.quotePreference === 'single' ? "'" : options.quotePreference === 'double' ? '"' : undefined
  if (!q || !options.quotePreference) {
    return
  }
  options.file
    .getDescendants()
    .filter(d => TypeGuards.isStringLiteral(d) || TypeGuards.isNoSubstitutionTemplateLiteral(d))
    .forEach(d => changeQuoteChar(d as any, q as QuoteChar))
}

export function quote(s: string, q: QuoteChar) {
  const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
  return q + newLiteral + q
}

export function changeQuoteChar(node: Quotable, newQuoteChar: QuoteChar) {
  const newText = quote(node.getLiteralText(), newQuoteChar)
  node.replaceWithText(newText)
}
