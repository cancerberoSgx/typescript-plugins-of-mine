import { Project } from 'ts-morph'
import { convertNamedImportsToNamespaceImport, convertNamespaceImportToNamedImports } from '../../src'
import { removeWhites } from 'misc-utils-of-mine-generic'

describe('convertImports', () => {
  it('convertImportNamespaceToNamed', () => {
    const code = `
      import * as m from "m";
      m.a;
      m.b;`
    const project = new Project()
    const f = project.createSourceFile('f1.ts', code)
    convertNamespaceImportToNamedImports(project, f)
    expect(removeWhites(f.getText())).toBe(
      removeWhites(`
      import { a,b } from "m";
      a;
      b;
    `)
    )
  })

  it('convertNamedImportsToNamespaceImport', () => {
    const code = `import {a,b,c} from './foo'; a(b,c)`
    const project = new Project()
    const f = project.createSourceFile('f1.ts', code)
    const i = f.getImportDeclarations()[0]
    convertNamedImportsToNamespaceImport(project, f)
    expect(f.getText()).toBe(`import * as foo from './foo'; foo.a(foo.b,foo.c)`)
  })
})
