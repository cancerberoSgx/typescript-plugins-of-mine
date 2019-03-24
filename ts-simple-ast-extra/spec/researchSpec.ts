
import Project from 'ts-morph';
import { convertNamedImportsToNamespaceImport, convertNamespaceImportToNamedImports } from '../src/refactor/refactors';
import * as ts from 'typescript'

xdescribe('researchSpec', () => {

  it('research', () => {
    const supported = ts.getSupportedCodeFixes().map(s => parseInt(s, 10))
    const tsDiagnostics = getTsDiagnostics()
    const supportedMessages = tsDiagnostics.filter(d => supported.includes(d.code)).map(d => `${d.code} - ${d.message}`).join('\n')
    console.log(supportedMessages);

  })

  interface TsDiagnostic {
    code: number,
    category: number,
    key: string,
    message: string,
    reportsUnneccesary: any
  }
  function getTsDiagnostics(): TsDiagnostic[] {
    return Object.values((ts as any).Diagnostics)
  }

})  
