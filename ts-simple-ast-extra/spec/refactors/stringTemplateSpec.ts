import { Project,  SyntaxKind } from 'ts-morph';
import { stringConcatenationToTemplate } from '../../src/refactor/stringTemplate';
import { removeWhites } from 'misc-utils-of-mine-generic';

describe('stringTemplate', () => {
  describe('string concatenation to template', () => {

  it('should change a string concatenation to a string template expression', () => {
    const project = new Project()
    const code = `
      const n = 2
      const c = 'counting ' + n + ' items'
    `
    const f = project.createSourceFile('f1.ts', code)!
    const c = f.getVariableDeclaration('c')!
    const expression = c.getFirstDescendantByKind(SyntaxKind.StringLiteral)!
    stringConcatenationToTemplate(project, expression)
    expect(removeWhites(f.getText()).startsWith(removeWhites(`
      const n = 2
      const c = \`counting \${n} items\`
    `)))
    
    // console.log(f.getText());
    
  })
})

})
