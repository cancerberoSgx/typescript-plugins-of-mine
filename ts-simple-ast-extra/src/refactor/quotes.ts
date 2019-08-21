import { Project, SourceFile, UserPreferences, StringLiteral, NoSubstitutionTemplateLiteral, TypeGuards } from 'ts-morph'
import { FormatCodeSettings, getDefaultFormatCodeSettings } from 'typescript'
import { RefactorFormatBaseOptions } from './format';

export interface QuotesOptions extends RefactorFormatBaseOptions {
  quotePreference: Quote
}

export function quotes(options: QuotesOptions) {
  var q = options.quotePreference === 'single' ? '\'' : options.quotePreference === 'double' ? '"' : undefined 
  if(!q){
    return 
  }
  options.file.getDescendants()
    .filter(d => TypeGuards.isStringLiteral(d) || TypeGuards.isNoSubstitutionTemplateLiteral(d))
    .forEach(d => changeQuoteChar(d as any, q as QuoteChar))
}

export type Quote = UserPreferences['quotePreference']
type Quotable = StringLiteral | NoSubstitutionTemplateLiteral
type QuoteChar = '"' | "'"

export function quote(s: string, q: QuoteChar) {
  const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
  return q + newLiteral + q
}

export function changeQuoteChar(node: Quotable, newQuoteChar: QuoteChar) {
  const newText = quote(node.getLiteralText(), newQuoteChar)
  node.replaceWithText(newText)
}

