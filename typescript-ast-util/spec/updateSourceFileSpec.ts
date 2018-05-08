import { compileSource, findChild } from "../src";
import * as ts from 'typescript'


/**
 * 
 * @param sourceFile 
 * @param positionWhereToAdd (spanStart)
 * @param textToAdd 
 */
function addText(sourceFile: ts.SourceFile, positionWhereToAdd: number, textToAdd: string, charCountToDeleteFromPos:number=0) : ts.SourceFile{
  const spanLength = charCountToDeleteFromPos // not removing 
  const oldTextLength = sourceFile.text.length
  const newText = sourceFile.text.substring(0, positionWhereToAdd) + textToAdd + sourceFile.text.substring(positionWhereToAdd, sourceFile.text.length)
  // forcing the newLength so ts asserts wont fail:
  // ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
  const newLength = spanLength + newText.length - sourceFile.text.length 
  return ts.updateSourceFile(sourceFile, newText,  { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength}, true)
  // return sourceFile.update(newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength })
}

describe('compileSource, findChildren and getJsDoc', () => {
  it('addTextTo sourcefile  should b easy to use', () => {
    const code1 = `
var b='mark123'
class A{}
const a=1
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
    const newSourceFile = addText(sourceFile, sourceFile.text.indexOf('mark123'), 'holalalala')

    expect(newSourceFile.getText()).toContain('holalalala')
    // sourcef)
    // console.log('finally:\n'+newSourceFile.getText())
    // const positionWhereToAdd = sourceFile.text.indexOf('mark123')
  // const textToAdd = 'asshsh'
  // const spanLength = 0 // not removing 
  // const oldTextLength = sourceFile.text.length
  // const newText = sourceFile.text.substring(0, positionWhereToAdd) + textToAdd + sourceFile.text.substring(positionWhereToAdd, sourceFile.text.length)
  // console.log('new text', newText)
  // forcing the newLength so ts asserts wont fail:
  // ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
  // const newLength = spanLength + newText.length - sourceFile.text.length 
  // sourceFile.update(newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength })

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
    // console.log(sourceFile.getText())
    const sf = sourceFile.update(newText, { span: { start: spanStart, length: spanLength }, newLength: newLength })
// console.log(sourceFile.getText())
    expect(sf.getText()).toContain('class Between{}')
  })


})
