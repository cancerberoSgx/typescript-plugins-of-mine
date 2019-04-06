import { removeWhites } from 'misc-utils-of-mine-generic'
import { Project, SyntaxKind } from 'ts-morph'
import { templateToStringConcatenation, templatesToStringConcatenations } from '../../src'

describe('stringConcatenationToTemplate', () => {
  describe('templateToStringConcatenation', () => {
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

  describe('templatesToStringConcatenations', () => {
    function test(code: string, expected: string) {
      const project = new Project()
      const f = project.createSourceFile('f1.ts', code)!
      templatesToStringConcatenations(f)
      expect(removeWhites(f.getText())).toContain(removeWhites(expected))
    }
    it('should change template expression to string concatenation', () => {
      test(
        `
      const verb = \`\${randomVerb()}\`
      const t = \`hello \${name} how \${verb} you \${time}\`
      export function f(a: string){
        return \`\${a} \${t}\`
      }
      export function g(n: number){
        return \`\${n + Math.PI}\`
      }
      `,
        `
      const verb = randomVerb()
      const t = "hello " + name + " how " + verb + " you " + time
      export function f(a: string){
        return a + " " + t
      }
      
      `
      )
    })

    xit('should force the result to be a string if not', () => {
      test(
        `
      export function g(n: number){
        return \`\${n + Math.PI}\`
      }
      `,
        `
      export function g(n: number){
        return n + Math.PI + ""
      }
      `
      )
    })
  })
})
