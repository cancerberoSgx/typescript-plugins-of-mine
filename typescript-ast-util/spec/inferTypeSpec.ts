import { compileSource, findChild } from "../src";
import * as ts from 'typescript'
describe('compileSource, findChildren and getJsDoc', () => {
  it('1', () => {
    const code1 = `
const a:number=1
function f(): {a: number: b: string[]}{return {a:1, b: []}}
const b = a+2
const c = 1+4
`
    const { project, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = project.getSourceFile(fileName)
    if (!sourceFile) {
      return fail()
    }

    // project.getTypeChecker().getTypeAtLocation(node)
    // project.getTypeChecker().getTypeOfSymbolAtLocation(symbol, node)

    let c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'c')
    if (!c) {
      return fail()
    }
    
    // console.log(project.getTypeChecker().getTypeAtLocation(c).getApparentProperties().map(ap=>findidap.valueDeclaration.parent).join(', '))
  })
})  