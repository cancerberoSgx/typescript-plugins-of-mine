// import {
//   Project,
//   SourceFile,
//   UserPreferences,
//   StringLiteral,
//   NoSubstitutionTemplateLiteral,
//   TypeGuards,
//   ts,
//   SyntaxKind
// } from 'ts-morph'
// import { FormatCodeSettings, getDefaultFormatCodeSettings } from 'typescript'
// import { RefactorFormatBaseOptions } from './format'
// import { enumNoValueKeys } from 'misc-utils-of-mine-generic'

// const SKN = enumNoValueKeys(SyntaxKind)
// type SyntaxKindNames = keyof typeof SKN
// export interface RemoveNodesOptions extends RefactorFormatBaseOptions {
//   byKind?: SyntaxKindNames[]
// }

// console.log(SKN)

// export function RemoveNodes(options: RemoveNodesOptions) {
//   var q = options.quotePreference === 'single' ? '\'' : options.quotePreference === 'double' ? '"' : undefined
//   if(!q){
//     return
//   }
//   options.file.getDescendants()
//     .filter(d => TypeGuards.isStringLiteral(d) || TypeGuards.isNoSubstitutionTemplateLiteral(d))
//     .forEach(d => changeQuoteChar(d as any, q as QuoteChar))
// }

// export type Quote = UserPreferences['quotePreference']
// type Quotable = StringLiteral | NoSubstitutionTemplateLiteral
// type QuoteChar = '"' | "'"

// export function quote(s: string, q: QuoteChar) {
//   const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
//   return q + newLiteral + q
// }

// export function changeQuoteChar(node: Quotable, newQuoteChar: QuoteChar) {
//   const newText = quote(node.getLiteralText(), newQuoteChar)
//   node.replaceWithText(newText)
// }
