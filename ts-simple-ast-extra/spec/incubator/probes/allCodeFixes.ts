import * as ts from 'typescript'
import { flat } from 'misc-utils-of-mine-generic'
import { Project } from 'ts-morph'
import { writeFileSync } from 'fs'
let supportedCodeFixes: TsDiagnostic[]
export function getAllSupportedCodeFixeDefinitions() {
  if (!supportedCodeFixes) {
    const supported = getAllSupportedCodeFixCodes()
    const tsDiagnostics = getTsDiagnostics()
    supportedCodeFixes = tsDiagnostics.filter(d => supported.includes(d.code))
  }
  return supportedCodeFixes
}

let allSupportedCodeFixCodes: number[]
function getAllSupportedCodeFixCodes() {
  if (!allSupportedCodeFixCodes) {
    allSupportedCodeFixCodes = ts.getSupportedCodeFixes().map(s => parseInt(s, 10))
  }
  return allSupportedCodeFixCodes
}
interface TsDiagnostic {
  code: number
  category: number
  key: string
  message: string
  reportsUnneccesary: any
}
function getTsDiagnostics(): TsDiagnostic[] {
  return Object.values((ts as any).Diagnostics)
}

export function getAllSupportedCodeFixes(
  languageService: ts.LanguageService,
  fileName: string,
  positionOrRange: number | ts.TextRange,
  formatOptions: ts.FormatCodeSettings = {},
  preferences: ts.UserPreferences = {}
): ReadonlyArray<ts.CodeFixAction> {
  const range: ts.TextRange =
    typeof positionOrRange === 'number' ? { pos: positionOrRange, end: positionOrRange } : positionOrRange
  const codeFixes = languageService.getCodeFixesAtPosition(
    fileName,
    range.pos,
    range.end,
    getAllSupportedCodeFixCodes(),
    formatOptions,
    preferences
  )
  return codeFixes
}

export interface CodeFixActionExtended extends ts.CodeFixAction {
  diagnostic: TsDiagnostic
}

export function getAllSupportedCodeFixesTryEach(
  languageService: ts.LanguageService,
  fileName: string,
  positionOrRange: number | ts.TextRange,
  formatOptions: ts.FormatCodeSettings = {},
  preferences: ts.UserPreferences = {}
): CodeFixActionExtended[] {
  const range: ts.TextRange =
    typeof positionOrRange === 'number' ? { pos: positionOrRange, end: positionOrRange } : positionOrRange
  const all = getAllSupportedCodeFixeDefinitions().map(c => {
    try {
      return languageService
        .getCodeFixesAtPosition(fileName, range.pos, range.end, [c.code], formatOptions, preferences)
        .map(tsc => ({ ...tsc, diagnostic: c }))
    } catch (error) {
      return []
    }
  })
  return flat(all as any)
}

function test() {
  writeFileSync('tmp.xt', JSON.stringify(getAllSupportedCodeFixeDefinitions(), null, 2))

  const project = new Project()
  const file = project.createSourceFile('f1.ts', `var a='',b="",c:["",''],d:{x:'',y:"asda"}`)
}
test()
