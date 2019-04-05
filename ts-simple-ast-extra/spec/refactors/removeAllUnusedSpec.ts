import { Project } from 'ts-morph'
import { removeAllUnused } from '../../src'
import { removeWhites } from 'misc-utils-of-mine-generic'

describe('removeAllUnused', () => {
  it('should remove all unused imports, functions, interfaces, classes parameters and variables', () => {
    const code = `
      import d from "foo";
      import d2, { used1 } from "foo";
      import { x } from "foo";
      import { x2, used2 } from "foo";
      used1; used2;

      function f(a, b) {
          const x = 0;
      }
      function g(a, b, c) { return a; }
      f; g;

      interface I {
          m(x: number): void;
      }

      class C implements I {
          m(x: number): void {} // Does not remove 'x', which is inherited
          n(x: number): void {}
          private ["o"](): void {}
      }
      C;

      declare function takesCb(cb: (x: number, y: string) => void): void;
      takesCb((x, y) => {});
      takesCb((x, y) => { x; });
      takesCb((x, y) => { y; });

      x => {
          const y = 0;
      };

      {
          let a, b;
      }
      for (let i = 0, j = 0; ;) {}
      for (const x of []) {}
      for (const y in {}) {}

      export type First<T, U> = T;
      export interface ISecond<T, U> { u: U; }
      export const cls = class<T, U> { u: U; };
      export class Ctu<T, U> {}
      export type Length<T> = T extends ArrayLike<infer U> ? number : never; // Not affected, can't delete
    `
    const project = new Project({ useVirtualFileSystem: true })
    const f = project.createSourceFile('f1.ts', code)
    removeAllUnused(project, f)
    expect(
      removeWhites(f.getText()).startsWith(
        removeWhites(`
      import { used1 } from "foo";
      import { used2 } from "foo";
      used1; used2;
    `)
      )
    )
  })

  it('should not remove exported declarations', () => {
    const project = new Project()
    const code = `
      const r = require('f')
      export function f(){}
      function foo(){}
      foo()
      function unu(){}
      const a = 1
    `
    const f = project.createSourceFile('f1.ts', code)
    project.createSourceFile('f2.ts', `import {f} from './f1';f()`)
    removeAllUnused(project, f) //, f.getFunction('foo'))

    expect(removeWhites(f.getText())).toBe(
      removeWhites(`
      export function f(){}
      function foo(){}
      foo()
    `)
    )
  })
})
