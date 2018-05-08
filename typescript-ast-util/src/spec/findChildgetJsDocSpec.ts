import { compileSource, getKindName, findChild, getJsDoc, visitChildrenRecursiveDeepFirst } from "..";
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
    if(!c.parent)
    {
      return fail()
    }

    // c.forEachChild(c=>{console.log(getKindName(c.kind))})
    // c.getChildren().forEach(c=>{console.log(getKindName(c.kind))})

    const jsdoc = getJsDoc(c)
    expect(jsdoc.length).toBe(1)
    // console.log(jsdoc[0].getText())
    expect(jsdoc[0].comment).toContain('description of something classy')
    expect(jsdoc[0].comment).toContain('a = 1')
    expect(jsdoc[0].tags).toBe(undefined)

    const m1 = findChild(sourceFile, c => c.kind == ts.SyntaxKind.MethodDeclaration)
    if(!m1){
      return fail()
    }
    const m1jsdoc = getJsDoc(m1)
    expect(m1jsdoc.length).toBe(1)
    expect(m1jsdoc[0].comment).toBeUndefined()
    if(!m1jsdoc[0].tags){
      return fail()
    }
    expect(m1jsdoc[0].tags.length).toBe(2);
    const paramjsdoc = m1jsdoc[0].tags[0]
    expect(paramjsdoc.tagName.escapedText.toString()).toBe('param')
    expect(paramjsdoc.comment).toBe('hello')
    expect(paramjsdoc.kind===ts.SyntaxKind.JSDocParameterTag)
    expect((paramjsdoc as ts.JSDocParameterTag).name.getText()).toBe('b');
    
    c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.PropertyDeclaration)
    if (c) {
      return fail()
    }

    let B = findChild(sourceFile, c => c.kind == ts.SyntaxKind.ClassDeclaration && ((c as ts.ClassDeclaration).name as ts.Identifier).escapedText=='B')
    if (!B) {
      return fail()
    }
    const Bjsdoc = getJsDoc(B)
    expect(!Bjsdoc || Bjsdoc.length==0).toBe(true)

  })
})