import { removeWhites } from 'misc-utils-of-mine-generic'
import { Project, SyntaxKind } from 'ts-morph'
import { templateToStringConcatenation } from '../../src'

describe('stringConcatenationToTemplate', () => {
  function test(code: string, expected: string) {
    const project = new Project()
    const f = project.createSourceFile('f1.ts', code)!
    const node = f.getFirstDescendantByKind(SyntaxKind.TemplateExpression)!
    templateToStringConcatenation(node)
    expect(removeWhites(f.getText())).toContain(removeWhites(expected))
  }
  it('should change template expression to string concatenation', () => {
    test(
      `const template1 = \`hello \${name} we are "glad" \${'you'} have \${1 + 2 + 3} years old\` ;`,
      `const template1 = "hello " + name + " we are \\"glad\\" " + 'you' + " have " + (1 + 2 + 3) + " years old" ;`
    )
  })
})
