import { removeWhites } from 'misc-utils-of-mine-generic'
import { Project } from 'ts-morph'
import { addTrailingSemicolons, removeTrailingSemicolons } from '../../src/refactor/trailingSemicolons'

describe('trailingSemicolon', () => {
  it('should remove trailing semicolon without breaking code', () => {
    const project = new Project({ useVirtualFileSystem: true })
    const code = `
      const r = require('f');
      import {foo} from 'bar';
      class C {}
      function f(){}
      export const c = 1;
      var g = 1;
      f();
      [1,2].join('');
      (true||false) && f();
      for(let i = 0; i< 2; i++){}
    `
    const f = project.createSourceFile('f1.ts', code)
    removeTrailingSemicolons(f)
    expect(removeWhites(f.getText())).toBe(
      removeWhites(`
      const r = require('f')
      import {foo} from 'bar'
      class C {}
      function f(){}
      export const c = 1
      var g = 1
      f();
      [1,2].join('');
      (true||false) && f()
      for(let i = 0; i< 2; i++){}
    `)
    )
  })

  it('should add trailing semicolon only when apply', () => {
    const project = new Project({ useVirtualFileSystem: true })
    const code = `
      const r = require('f')
      import {foo} from 'bar'
      class C {}
      function f(){}
      export const c = 1
      var g = 1
      f();
      [1,2].join('');
      (true||false) && f()
      for(let i = 0; i< 2; i++){}
    `
    const f = project.createSourceFile('f1.ts', code)
    addTrailingSemicolons(f)
    expect(removeWhites(f.getText())).toBe(
      removeWhites(`
      const r = require('f');
      import {foo} from 'bar';
      class C {}
      function f(){}
      export const c = 1;
      var g = 1;
      f();
      [1,2].join('');
      (true||false) && f();
      for(let i = 0; i< 2; i++){}
    `)
    )
  })

  it('should not remove semicolons if next sibling is on the same line', () => {
    const project = new Project({ useVirtualFileSystem: true })
    const code = `
    debugger
    editor.getModel()!.onDidChangeContent(e => { debugger; setDirty() })
    `
    const f = project.createSourceFile('f1.ts', code)
    removeTrailingSemicolons(f)
    expect(removeWhites(f.getText())).toBe(
      removeWhites(`
      debugger
      editor.getModel()!.onDidChangeContent(e => { debugger; setDirty() })
    `)
    )
  })
})
