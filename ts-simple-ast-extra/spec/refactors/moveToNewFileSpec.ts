import { Project } from 'ts-morph'
import { moveToNewFile } from '../../src'

describe('moveToNewFile', () => {
  it('should move declaration to new file', () => {
    const project = new Project()
    const code = `
      export class Class1 {}
      const c = new Class1()
    `
    const f = project.createSourceFile('f1.ts', code)

    const result = moveToNewFile(project, f.getClass('Class1')!)

    expect(f.getText()).not.toContain('class Class1')
    expect(f.getText()).toContain('import { Class1 } from "./Class1";')
    const newFile = project.getSourceFile('Class1.ts')
    expect(newFile!.getText()).toContain('export class Class1')

    expect(result!.created[0].getBaseName()).toBe('Class1.ts')
    expect(result!.modified[0].getBaseName()).toBe('f1.ts')
  })
})
