import { SyntaxKind } from 'ts-morph'
import { getObjectFlags, getSymbolFlags, getTypeFlags } from '../src'
import { getFile } from './testUtil'

describe('flags', () => {
  const code1 = `
interface I{}
interface I1 extends I{}
interface I2<T> extends I1{}
interface J{}
interface I3<T> extends I2<T>, J{} 
class A implements I{}
class B extends A implements J{}
class C<T> extends B implements I2<T>{}
class D<T> extends C<T> implements I3{} 
var x = new A()
`
  it('getSymbolFlags', () => {
    expect(
      getSymbolFlags(
        getFile(code1)
          .getClass('A')!
          .getType()
          .getSymbol()!
      )
    ).toEqual(['None', 'Class', 'PropertyExcludes', 'NamespaceModuleExcludes'])
    expect(
      getSymbolFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'I')!
          .getType()
          .getSymbol()!
      )
    ).toEqual(['None', 'Interface', 'PropertyExcludes', 'NamespaceModuleExcludes'])
    expect(
      getSymbolFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'T')!
          .getType()
          .getSymbol()!
      )
    ).toEqual(['None', 'TypeParameter', 'PropertyExcludes', 'NamespaceModuleExcludes'])
    expect(
      getSymbolFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'x')!
          .getType()
          .getSymbol()!
      )
    ).toEqual(['None', 'Class', 'PropertyExcludes', 'NamespaceModuleExcludes'])
  })

  it('getTypeFlags', () => {
    expect(
      getTypeFlags(
        getFile(code1)
          .getClass('A')!
          .getType()
      )
    ).toEqual([
      'Object',
      'StructuredType',
      'StructuredOrInstantiable',
      'ObjectFlagsType',
      'Narrowable',
      'NotUnionOrUnit',
      'NotPrimitiveUnion',
      'IncludesMask'
    ])
    expect(
      getTypeFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'I')!
          .getType()!
      )
    ).toEqual([
      'Object',
      'StructuredType',
      'StructuredOrInstantiable',
      'ObjectFlagsType',
      'Narrowable',
      'NotUnionOrUnit',
      'NotPrimitiveUnion',
      'IncludesMask'
    ])
    expect(
      getTypeFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'T')!
          .getType()!
      )
    ).toEqual([
      'TypeParameter',
      'TypeVariable',
      'InstantiableNonPrimitive',
      'Instantiable',
      'StructuredOrInstantiable',
      'Narrowable',
      'NotPrimitiveUnion',
      'IncludesStructuredOrInstantiable'
    ])
    expect(
      getTypeFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'x')!
          .getType()!
      )
    ).toEqual([
      'Object',
      'StructuredType',
      'StructuredOrInstantiable',
      'ObjectFlagsType',
      'Narrowable',
      'NotUnionOrUnit',
      'NotPrimitiveUnion',
      'IncludesMask'
    ])
  })

  it('getObjectFlags', () => {
    expect(
      getObjectFlags(
        getFile(code1)
          .getClass('A')!
          .getType()
      )
    ).toEqual(['Class', 'Reference', 'ClassOrInterface'])
    expect(
      getObjectFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'I')!
          .getType()!
      )
    ).toEqual(['Interface', 'ClassOrInterface'])
    expect(
      getObjectFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'T')!
          .getType()!
      )
    ).toEqual([])
    expect(
      getObjectFlags(
        getFile(code1)
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .find(i => i.getText() === 'x')!
          .getType()!
      )
    ).toEqual(['Class', 'Reference', 'ClassOrInterface'])
  })
})
