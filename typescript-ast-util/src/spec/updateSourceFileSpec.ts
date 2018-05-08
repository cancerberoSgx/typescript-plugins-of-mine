import { compileSource, findChild } from "..";
import * as ts from 'typescript'
describe('compileSource, findChildren and getJsDoc', () => {
  it('1', () => {
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
    const { project, fileName, tsconfigPath } = compileSource(code1)
    const sourceFile = project.getSourceFile(fileName)
    if (!sourceFile) {
      return fail()
    }

    let c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.ClassDeclaration && ((c as ts.ClassDeclaration).name as ts.Identifier).escapedText=='A')
    if (!c) {
      return fail()
    }


    const newFragment = `\nclass Between{}\n`
    const newText = 
    `
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
${newFragment}
/* non jsdoc comment */
class B{}
`



    // ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);

    // textChangeRange.newLength ? newText.length -oldText.length + textChangeRange.span.length


    console.log(sourceFile.getText().length , '-', newFragment.length , '+', newText.length, '===', newText.length)
    sourceFile.update(newText, {span: {start: c.getEnd(), length: newFragment.length}, newLength: newText.length})

    console.log(sourceFile.getFullText());
    
  })
})