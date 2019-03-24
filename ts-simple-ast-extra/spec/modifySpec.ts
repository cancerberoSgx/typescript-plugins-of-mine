import {Project, SyntaxKind, TypeGuards} from'ts-morph'
import { array2DInsert } from '../src';
import { removeWhites } from '../src/misc';

describe('modify', () => {
  describe('array2DInsert', () => {
  it('put should place data at given fileId / index in the array literal creating empty elements if necessary', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
    const data: any[][] = []
    `
    )
    const v = f.getVariableDeclarationOrThrow('data')
    const init = v.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
    array2DInsert(init, 2, 3, [`{text: 'Array<string>', prefix: 'interface I{}'}`])
    expect(f.getText()).toContain(
      `const data: any[][] = [[], [], [{text: 'Array<string>', prefix: 'interface I{}'}]]`
    )
  })

  it('Should be able to insert a complex object', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
    const data: any[][] = [[], [], ['', ''], []]
    `
    )
    const v = f.getVariableDeclarationOrThrow('data')
    const init = v.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
    array2DInsert(init, 2, 3, [
      `{name: 'foo', friends: [{name: 'sd', friends: [], foo: function(a:number){return a+1}}]}`
    ])
    expect(f.getText()).toContain(
      `const data: any[][] = [[], [], [{name: 'foo', friends: [{name: 'sd', friends: [], foo: function(a:number){return a+1}}]}], []]`
    )
    let a = init.getElements()[2]
    if (TypeGuards.isArrayLiteralExpression(a)) {
      const a2 = a.getElements()[0]
      if (TypeGuards.isObjectLiteralExpression(a2)) {
        expect(
          removeWhites(
            a2
              .getProperties()
              .map(p => p.getText())
              .join(', m')
          )
        ).toContain(
          removeWhites(`name: 'foo', mfriends: [{name: 'sd', friends: [], foo: function(a:number){return a+1}}]`)
        )
      }
    }
  })
})
})