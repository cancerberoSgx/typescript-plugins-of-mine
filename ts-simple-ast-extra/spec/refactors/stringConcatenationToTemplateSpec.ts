import { Project, SyntaxKind } from 'ts-morph'
import { stringConcatenationToTemplate } from '../../src'
import { removeWhites } from 'misc-utils-of-mine-generic'

describe('stringConcatenationToTemplate', () => {
  it('should change a string concatenation to a string template expression', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'f1.ts',
      `
        const n = 2
        const c = 'counting ' + n + ' items'
      `
    )!
    const node = f.getFirstDescendantByKind(SyntaxKind.StringLiteral)!
    stringConcatenationToTemplate(project, node)
    expect(removeWhites(f.getText())).toContain(
      removeWhites(`
            const n = 2
            const c = \`counting \${n} items\`
          `)
    )
  })
})
