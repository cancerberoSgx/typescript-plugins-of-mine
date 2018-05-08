import { compileSource, findChild, filterChildren } from "../src";
import * as ts from 'typescript'

describe('ts.forEachChild vs node.forEachChild vs node.getChildren, etc', () => {
  it('1', () => {
    const code1 = `
class A {
  m(b:string){
    if(b=='hello')
      return 1
  }
}
`
expect(true).toBeTruthy()
    const { program, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = program.getSourceFile(fileName)
    if (!sourceFile) {
      return fail()
    }
    const predicate =  (c:ts.Node) => c.kind == ts.SyntaxKind.StringLiteral && ((c as ts.StringLiteral).getText() == '\'hello\'')
    let str:ts.Node = findChild(sourceFile,predicate)
    if (!str) {
      return fail('findChild did not found string literal')
    }
    str = undefined
    ts.forEachChild(sourceFile, c=>{
      if(predicate(c)){
        str=c
      }
    })
    if (str) { // we verified that ts.forEachChild(sourceFile, ) does not "Walk the tree to search for classes" as documentation say https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
      return fail(' ts.forEachChild did not found string literal')
    }

    const filtered = filterChildren(sourceFile, c=> c.kind == ts.SyntaxKind.NumericLiteral)// && ((c as ts.NumericLiteral).getText() == '1'))
    if (!filtered||!filtered.length) {
      return fail('filterChildren did not found number literal 1')
    }

    let nu:ts.Node = findChild(sourceFile, c=> c.kind == ts.SyntaxKind.NumericLiteral)
    if (!nu) {
      return fail('findChild did not found number literal')
    }

  })
})