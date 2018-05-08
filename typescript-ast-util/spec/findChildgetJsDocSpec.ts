import { compileSource, findChild } from "../src";
import * as ts from 'typescript'

xdescribe('ts.forEachChild vs node.forEachChild vs node.getChildren, etc', () => {
  it('1', () => {
    const code1 = `
class A {
  m(b:string){
    if(b=='hello')
      return 1
  }
}
`
    const { project, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = project.getSourceFile(fileName)
    if (!sourceFile) {
      return fail()
    }
    let c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.StringLiteral && ((c as ts.StringLiteral).getText() == 'hello'))
    if (!c) {
      return fail()
    }

    console.log(c)
   
  })
})