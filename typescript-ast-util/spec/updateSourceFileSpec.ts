import { compileSource, findChild, addTextToSourceFile } from "../src";
import * as ts from 'typescript'
import { updateSourceFile } from '../src/sourceFileManipulation';


describe('updateSourceFile ,addTextToSourceFile', () => {

  let code1 = `const b = 'mark123';
  function f() {return [1,2, n, n*n]}
  class A{}
  const a=1; 
  `
  let sourceFile: ts.SourceFile, program: ts.Program, fileName: string, tsconfigPath: string
  beforeEach(() => {
    const result = compileSource(code1)
    program = result.program
    sourceFile = program.getSourceFile(result.fileName)
    if (!sourceFile) {
      return fail()
    }
  })

  it('updateSourceFile', () => {
    let f = findChild(sourceFile, c => ts.isFunctionDeclaration(c) && c.name.getText() === 'f') as ts.FunctionDeclaration
    const newSourceFile = updateSourceFile(sourceFile, { start:f.body.statements[0].getStart(), end:f.body.statements[0].getEnd(), newText: `return 'changed!';` })
    expect(newSourceFile.getText()).toContain(`function f() {return 'changed!';}`)
    // console.log(newSourceFile.getText());
  })


  it('addTextTo sourcefile  should b easy to use', () => {
    expect(addTextToSourceFile(sourceFile, sourceFile.text.indexOf('mark123'), 'holalalala').getText()).toContain('const b = \'holalalalamark123\'')
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
