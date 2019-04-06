import { Project, SyntaxKind } from 'ts-morph'
import { stringConcatenationToTemplateExpression, stringConcatenationsToTemplateExpressions } from '../../src'
import { removeWhites } from 'misc-utils-of-mine-generic'

describe('stringConcatenationToTemplate', () => {
  describe('stringConcatenationToTemplateExpression', () => {
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
      stringConcatenationToTemplateExpression(node, project.getTypeChecker())
      expect(removeWhites(f.getText())).toContain(
        removeWhites(`
            const n = 2
            const c = \`counting \${n} items\`
          `)
      )
    })
  })

  describe('stringConcatenationsToTemplateExpressions', () => {
    it('should change a string concatenation to a string template expression', () => {
      const project = new Project()
      const f = project.createSourceFile(
        'f1.ts',
        `
        const n = 2
        const c = 'counting ' + n + ' items'
        const b = 'he said "' + c + \` \${ n * 2} \` + "times!"
        function f(a: string) {
          return a + ' shots'
        } 
        function g(a: number) {
          return a + 2
        } 
      `
      )!
      stringConcatenationsToTemplateExpressions(f, project.getTypeChecker())
      expect(removeWhites(f.getText())).toContain(
        removeWhites(`
        const n = 2
        const c = \`counting \${n} items\`
        const b = \`he said "\${c}\${\` \${ n * 2} \`}times!\`
        function f(a: string) {
          return \`\${a} shots\`
        }
        function g(a: number) {
          return a + 2
        }
      `)
      )
    })
  })
})
