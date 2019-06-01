import { Identifier, Project, TypeGuards } from 'ts-morph'
import { buildAstPath, selectNode, printAstPath, getKindName } from '../src'

describe('astPath', () => {
  it('Should create astPath for a node and be able to select it from a SourceFile copy', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      interface I<T=any>{
        p:T
      }
      /** comment1 */
      class A implements I<number> {
        /** comment2 */
        p=9
        protected h=0
        m(i:number){
        }
        n(){
          var aVariable1 = [0,false]
          return new Date()
        }
        private g(){return 1}
      }`
    )
    const n = f
      .getDescendants()
      .filter(TypeGuards.isIdentifier)
      .find(i => i.getText() === 'aVariable1')!
    const sel = buildAstPath(n)
    const n2 = selectNode<Identifier>(sel, f.copy('test_copy.ts'))
    expect(n2!.getText()).toBe('aVariable1')
  })

  it("should select SourceFile's children", () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      class A {}
      function f(){}
      interface I {}`
    )!
    const n = f.getInterface('I')!
    const sel = buildAstPath(n, undefined, { includeNodeKind: true })
    expect(sel.path.map(p => p.index + ' - ' + getKindName(p.nodeKind!))).toEqual([
      '0 - SourceFile',
      '2 - InterfaceDeclaration'
    ])
    expect(selectNode(sel, f)!.getKindName()).toBe('InterfaceDeclaration')
  })

  it('should build selector and select using mode===getChildren', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      class A {}
      function f(){}
      interface I {}`
    )!
    const n = f.getInterface('I')!
    const sel = buildAstPath(n, undefined, { includeNodeKind: true, mode: 'getChildren' })
    expect(sel.path.map(p => p.index + ' - ' + getKindName(p.nodeKind!))).toEqual([
      '0 - SourceFile',
      '2 - InterfaceDeclaration'
    ])
    expect(selectNode(sel, f)!.getKindName()).toBe('InterfaceDeclaration')
  })

  it('Should select another thing if structure changed', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }`
    )!
    const n = f
      .getDescendants()
      .filter(TypeGuards.isIdentifier)
      .find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n, undefined, { includeNodeKind: true })
    expect(selectNode<Identifier>(sel, f)!.getText()).toBe('aParameter1')

    const f2 = project.createSourceFile(
      'test2.ts',
      `
      interface I<T=any>{
        m(i: number, g: (newParameter1: boolean, aParameter1: number)=>void)
      }`
    )
    expect(selectNode<Identifier>(sel, f2)!.getText()).toBe('newParameter1')
  })

  it('Should select another thing if structure changed', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }
      `
    )!
    const n = f
      .getDescendants()
      .filter(TypeGuards.isIdentifier)
      .find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n)
    expect(selectNode<Identifier>(sel, f)!.getText()).toBe('aParameter1')
    const sel2 = buildAstPath(n, undefined, { includeNodeKind: true, mode: 'getChildren' })
    expect(selectNode<Identifier>(sel2, f)!.getText()).toBe('aParameter1')

    const f2 = project.createSourceFile(
      'test2.ts',
      `
      interface I<T=any>{
        m(i: number, g: (newParameter1: boolean, aParameter1: number)=>void)
      }`
    )
    expect(selectNode<Identifier>(sel, f2)!.getText()).toBe('newParameter1')
  })

  it('Should print path with ancestors syntax kind and index', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }
      `
    )!
    const n = f
      .getDescendants()
      .filter(TypeGuards.isIdentifier)
      .find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n, n.getSourceFile(), { includeNodeKind: true })
    expect(printAstPath(sel)).toBe(
      'SourceFile>InterfaceDeclaration:nth-child(0)>MethodSignature:nth-child(2)>Parameter:nth-child(2)>FunctionType:nth-child(1)>Parameter:nth-child(0)>Identifier:nth-child(0)'
    )
  })

  it('Should print onlyIndex syntax and custom level separator', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }
      `
    )!
    const n = f
      .getDescendants()
      .filter(TypeGuards.isIdentifier)
      .find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n, n.getSourceFile(), { includeNodeKind: false })
    expect(printAstPath(sel, { onlyIndex: true, levelSeparator: '/' })).toBe('0/0/2/2/1/0/0')
    const n2 = f.getDescendants().find(d => d.getText() === 'void')!
    const sel2 = buildAstPath(n2, n2.getSourceFile(), { includeNodeKind: false })
    expect(printAstPath(sel2, { onlyIndex: true, levelSeparator: '/' })).toBe('0/0/2/2/1/1')
  })

  it('Should print onlyKindName syntax and custom level separator', () => {
    const project = new Project()
    const f = project.createSourceFile(
      'test.ts',
      `
      interface I<T=any>{
        m(i: number, g: (aParameter1: number)=>void)
      }
      `
    )!
    const n = f
      .getDescendants()
      .filter(TypeGuards.isIdentifier)
      .find(i => i.getText() === 'aParameter1')!
    const sel = buildAstPath(n, n.getSourceFile(), { includeNodeKind: true })
    expect(printAstPath(sel, { onlyKindName: true, levelSeparator: '/' })).toBe(
      'SourceFile/InterfaceDeclaration/MethodSignature/Parameter/FunctionType/Parameter/Identifier'
    )
    const n2 = f.getDescendants().find(d => d.getText() === 'void')!
    const sel2 = buildAstPath(n2, n2.getSourceFile(), { includeNodeKind: true })
    expect(printAstPath(sel2, { onlyKindName: true, levelSeparator: '/' })).toBe(
      'SourceFile/InterfaceDeclaration/MethodSignature/Parameter/FunctionType/VoidKeyword'
    )
  })
  xit('Should fail to select if verifyNodeKind is provided and structure is the same but some node kind changed in the path', () => {})

  xit('Should select if verifyNodeKind is provided and kinds in the path did not change', () => {})

  xit('Should select if kinds in the path changed but verifyNodeKind was not provided ', () => {})
})
