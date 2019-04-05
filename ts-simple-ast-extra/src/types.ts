import { ClassDeclaration, ExpressionWithTypeArguments, TypeGuards, InterfaceDeclaration, Node } from 'ts-morph'
import { notUndefined } from './misc'
/**
 * Returns all implements clauses of this class and its super classes both things recursively
 */
export const getImplementsAll = (cl: ClassDeclaration): ExpressionWithTypeArguments[] => {
  let result: ExpressionWithTypeArguments[] = []
  cl.getImplements().forEach(impl => {
    // TODO: types like A|B
    result.push(impl)
    impl
      .getType()
      .getSymbolOrThrow()
      .getDeclarations()
      .forEach(d => {
        if (TypeGuards.isInterfaceDeclaration(d)) {
          result = result.concat(getExtendsRecursively(d))
        }
      })
  })
  getExtendsRecursively(cl).forEach(ext => {
    ext
      .getType()
      .getSymbolOrThrow()
      .getDeclarations()
      .forEach(d => {
        if (TypeGuards.isClassDeclaration(d)) {
          result = result.concat(getImplementsAll(d))
        }
      })
  })
  return result
}

/**
 *
 * Returns all the extended classes or interface of given class or interface declaration ,recursively
 */
export const getExtendsRecursively = (decl: ClassDeclaration | InterfaceDeclaration): ExpressionWithTypeArguments[] => {
  let extendExpressions = TypeGuards.isClassDeclaration(decl)
    ? decl.getExtends()
      ? [decl.getExtends()]
      : []
    : decl.getExtends()
  extendExpressions.filter(notUndefined).forEach(expr => {
    if (expr.getType().getSymbol()) {
      expr
        .getType()
        .getSymbol()!
        .getDeclarations()
        .forEach(d => {
          if (TypeGuards.isInterfaceDeclaration(d) || TypeGuards.isClassDeclaration(d)) {
            extendExpressions = extendExpressions.concat(getExtendsRecursively(d))
          }
        })
    }
  })
  return extendExpressions.filter(notUndefined)
}

export const findInterfacesWithPropertyNamed = (decl: ClassDeclaration, memberName: string): InterfaceDeclaration[] =>
  getImplementsAll(decl)
    .map(expr =>
      expr
        .getType()
        .getSymbolOrThrow()
        .getDeclarations()
    )
    .reduce((a, v) => a.concat(v), [])
    .filter(TypeGuards.isInterfaceDeclaration)
    .filter(d => d.getMembers().find(m => TypeGuards.isPropertyNamedNode(m) && m.getName() === memberName))
    .filter((value, pos, arr) => arr.indexOf(value) === pos) // union

export function isDeclaration(n: Node) {
  return (
    TypeGuards.isConstructorDeclaration(n) ||
    TypeGuards.isEnumDeclaration(n) ||
    TypeGuards.isClassLikeDeclarationBase(n) ||
    TypeGuards.isExportDeclaration(n) ||
    TypeGuards.isImportDeclaration(n) ||
    TypeGuards.isMethodDeclaration(n) ||
    TypeGuards.isFunctionDeclaration(n) ||
    TypeGuards.isVariableDeclaration(n) ||
    TypeGuards.isPropertyDeclaration(n) ||
    TypeGuards.isVariableDeclarationList(n) ||
    TypeGuards.isInterfaceDeclaration(n) ||
    TypeGuards.isNamespaceDeclaration(n) ||
    TypeGuards.isParameterDeclaration(n) ||
    TypeGuards.isTypeAliasDeclaration(n) ||
    TypeGuards.isSignaturedDeclaration(n) ||
    TypeGuards.isConstructorDeclaration(n) ||
    TypeGuards.isSignaturedDeclaration(n) ||
    TypeGuards.isConstructSignatureDeclaration(n) ||
    TypeGuards.isGetAccessorDeclaration(n) ||
    TypeGuards.isSetAccessorDeclaration(n) ||
    TypeGuards.isFunctionLikeDeclaration(n) ||
    TypeGuards.isImportEqualsDeclaration(n) ||
    TypeGuards.isCallSignatureDeclaration(n) ||
    TypeGuards.isIndexSignatureDeclaration(n) ||
    TypeGuards.isConstructSignatureDeclaration(n) ||
    TypeGuards.isMethodSignature(n)
  )
}
