import { Project, SyntaxKind } from 'ts-morph'
import { GeneralNode, getGeneralNodePath, getGeneralNodeChildren, getGeneralNodeParent } from '../src/generalNode'
import { pwd } from 'shelljs'

describe('generalNode', () => {
  it('should have path', () => {
    const p = new Project()
    p.createSourceFile('src/foo/bar.ts', ' export const a = 1')
    const d = p.getDirectories()[0] as GeneralNode
    expect(getGeneralNodePath(d, pwd())).toBe('src/foo')
    expect(getGeneralNodePath(getGeneralNodeParent(d)!, pwd())).toBe('src')
    expect(getGeneralNodeChildren(d).map(c => getGeneralNodePath(c, pwd()))).toEqual(['src/foo/bar.ts'])
    const f = p.createSourceFile('src/foo/d/a.ts', 'export function f(a: string[]){}')
    expect(getGeneralNodeChildren(d).map(c => getGeneralNodePath(c, pwd()))).toEqual(['src/foo/d', 'src/foo/bar.ts'])
    const a = f.getFirstDescendantByKindOrThrow(SyntaxKind.Parameter)
    expect(getGeneralNodePath(a, pwd())).toBe('src/foo/d/a.ts#FunctionDeclaration:nth-child(0)>Parameter:nth-child(2)')
  })
  // fit('all general nodes should have path', () => {
  //   const p = new Project()
  //   p.createSourceFile('src/foo/bar.ts', ' export const a = 1')
  //   const d = p.getDirectories()[0] as GeneralNode
  //   expect(getGeneralNodePath(d, pwd())).toBe('src/foo')
  //   expect(getGeneralNodePath(getGeneralNodeParent(d)!, pwd())).toBe('src')
  //   expect(getGeneralNodeChildren(d).map(c => getGeneralNodePath(c, pwd()))).toEqual(['src/foo/bar.ts']);
  //   p.createSourceFile('src/foo/d/a.ts', 'export function f(a: sting){}')
  //   expect(getGeneralNodeChildren(d).map(c => getGeneralNodePath(c, pwd()))).toEqual(['src/foo/d', 'src/foo/bar.ts']);
  // })
})
