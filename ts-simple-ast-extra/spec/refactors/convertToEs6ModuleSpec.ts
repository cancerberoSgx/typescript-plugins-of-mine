import { Project } from 'ts-morph'
import { convertToEs6Module } from '../../src'

describe('convertToEs6Module', () => {
  it('should convert requires to imports', () => {
    const project = new Project({ useVirtualFileSystem: true })
    const code = `
      const r = require('f')
      const f = foo('r')
      import {foo} from 'bar'
    `
    const f = project.createSourceFile('f1.ts', code)
    convertToEs6Module(project, f)
    expect(f.getText()).toContain("import r=require('f');")
  })
})
