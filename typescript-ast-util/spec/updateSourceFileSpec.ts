import { compileSource, findChild, addTextToSourceFile } from "../src";
import * as ts from 'typescript'


describe('compileSource, findChildren and getJsDoc', () => {
  it('addTextTo sourcefile  should b easy to use', () => {
    const code1 = `const b = 'mark123';
function f() {return [1,2, n, n*n]}
class A{}
const a=1; 
`
    const { program, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = program.getSourceFile(fileName)
    if (!sourceFile) {
      return fail()
    }

    let a = findChild(sourceFile, c => c.kind == ts.SyntaxKind.FunctionDeclaration && ((c as ts.FunctionDeclaration).name as ts.Identifier).escapedText == 'a')

    let f = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'f')
    const newSourceFile = addTextToSourceFile(sourceFile, sourceFile.text.indexOf('mark123'), 'holalalala')
    expect(newSourceFile.getText()).toContain('holalalala')
  })


it('by hand learning how to use this undocumented TextEditRange thingy', () => {
    const code1 = `
/**
 * description of something classy
 * 
 * Another paragraph with ex: 
 * 
 * \`\`\`
 * var a = 1
 * \`\`\`
 */
class A {
  /**
   * @param b hello
   * @return the number one
   */
  m(b:string){return 1}
}
/* non jsdoc comment */
class B{}
`
    const { program, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = program.getSourceFile(fileName)
    if (!sourceFile) {
      return fail()
    }
    const newFragment = `\nclass Between{}\n`
    const newText =
      `${newFragment}
/**
 * description of something classy
 * 
 * Another paragraph with ex: 
 * 
 * \`\`\`
 * var a = 1
 * \`\`\`
 */
class A {
  /**
   * @param b hello
   * @return the number one
   */
  m(b:string):number{return 1}
}
/* non jsdoc comment */
class B{}
`
    const spanStart = 20
    const spanLength = 0 //not removing 
    const oldTextLength = sourceFile.text.length
    const newLength = 0 + newText.length - oldTextLength
    const sf = sourceFile.update(newText, { span: { start: spanStart, length: spanLength }, newLength: newLength })
    expect(sf.getText()).toContain('class Between{}')
  })


})
