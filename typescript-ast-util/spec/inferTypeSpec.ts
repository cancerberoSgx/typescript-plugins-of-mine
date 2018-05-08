import { compileSource, findChild, findIdentifierString, dumpAst, getKindName, getTypeStringFor } from "../src";
import * as ts from 'typescript'
describe('compileSource, findChildren and getJsDoc', () => {
  it('1', () => {
    const code1 = `
const a=1
function f(): {a: number: b: string[]}{return {a:1, b: []}}
const b = a+2
const c = 1+4
const d = f()
const typedConst: Array<Date> = []
`
    const { program, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = program.getSourceFile(fileName)
    
    if (!sourceFile) {
      return fail()
    }
    
    let a = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'a')
    if (!a) {
      return fail()
    }
    const at = program.getTypeChecker().getTypeAtLocation(a)
    expect(at.symbol).toBeUndefined()

    let typedConst = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'typedConst')
    if (!typedConst) {
      return fail()
    }
    const typedConstType = program.getTypeChecker().getTypeAtLocation(typedConst)
    expect(typedConstType.symbol.escapedName.toString()).toBe('Array')
    
    let c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'c')
    if (!c) {
      return fail()
    }
    expect(getTypeStringFor(c, program)).toBe('number')
    
    let b= findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'b')
    if (!b) {
      return fail()
    }
    expect(getTypeStringFor(c, program)).toBe('number')
    
    let d= findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'd')
    if (!d) {
      return fail()
    }
    expect(getTypeStringFor(d, program).replace(/\s+/g, '')).toBe('{a:number;b:string[];}')
    
    let f= findChild(sourceFile, c => c.kind == ts.SyntaxKind.FunctionDeclaration && ((c as ts.FunctionDeclaration).name as ts.Identifier).escapedText == 'f')
    if (!f) {
      return fail()
    }
    expect(getTypeStringFor(f, program).replace(/\s+/g, '')).toBe('()=>{a:number;b:string[];}')

  })
})  
