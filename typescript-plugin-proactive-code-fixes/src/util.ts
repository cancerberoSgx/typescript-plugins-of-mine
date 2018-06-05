import { ParameterDeclaration, ParameterDeclarationStructure, FunctionLikeDeclaration, MethodSignature, ExpressionWithTypeArguments, ClassDeclaration, TypeGuards, InterfaceDeclaration, Type } from "ts-simple-ast";
// import {Type as ts.Type} from "../../typescript-ast-util/node_modules/typescript";


export const buildParameterStructure = (p: ParameterDeclaration): ParameterDeclarationStructure => ({
  name: p.getNameOrThrow(),
  hasQuestionToken: p.hasQuestionToken(),
  type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
  isRestParameter: p.isRestParameter(),
  scope: p.hasScopeKeyword() ? p.getScope() : undefined
})


/** fix given function-like declaration parameters and type to implement given signature */
export function fixSignature(decl: FunctionLikeDeclaration, signature: MethodSignature): void {
  decl.setReturnType(signature.getReturnType().getText())
  // add missing params and fix exiting param types
  let memberParams = decl.getParameters()
  let signatureParams = signature.getParameters()
  for (let i = 0; i < signatureParams.length; i++) {
    const signatureParam = signatureParams[i]
    if (memberParams.length <= i) {
      decl.addParameter(buildParameterStructure(signatureParam))
    } else {
      const memberParam = memberParams[i]
      if (!areTypesEqual(memberParam.getType(), signatureParam.getType())) {
        memberParam.fill({ ...buildParameterStructure(signatureParam), name: memberParam.getName() })
      }
    }
  }
  // remove extra non optional params member signature might have
  memberParams = decl.getParameters()
  signatureParams = signature.getParameters()
  if (memberParams.length > signatureParams.length) {
    for (let i = signatureParams.length; i < memberParams.length; i++) {
      if (!(memberParams[i].hasInitializer() || memberParams[i].isOptional())) {
        memberParams[i].remove()
      }
    }
  }
}

/** dirty way of checking if two types are compatible */
export function areTypesEqual(t1: Type, t2: Type): boolean { return t1.getText().replace(/\s+/gi, '') === t2.getText().replace(/\s+/gi, '') }


/**
 * returns all implements clauses of this class and its super classes both things recursively 
 */
export const getImplementsAll = (cl: ClassDeclaration): ExpressionWithTypeArguments[] => {
  let result: ExpressionWithTypeArguments[] = []
  cl.getImplements().forEach(impl => {
    // TODO: types like A|B
    result.push(impl)
    impl.getType().getSymbolOrThrow().getDeclarations().forEach(d => {
      if (TypeGuards.isInterfaceDeclaration(d)) {
        result = result.concat(getExtendsRecursively(d))
      }
    })
  });
  getExtendsRecursively(cl).forEach(ext => {
    ext.getType().getSymbolOrThrow().getDeclarations().forEach(d => {
      if (TypeGuards.isClassDeclaration(d)) {
        result = result.concat(getImplementsAll(d))
      }
    })
  })
  return result
}

export const getExtendsRecursively = (decl: ClassDeclaration | InterfaceDeclaration): ExpressionWithTypeArguments[] => {
  let extendExpressions = TypeGuards.isClassDeclaration(decl) ? (decl.getExtends() ? [decl.getExtends()] : []) : decl.getExtends()
  extendExpressions.forEach(expr => {
    expr.getType().getSymbol().getDeclarations().forEach(d => {
      if (TypeGuards.isInterfaceDeclaration(d) || TypeGuards.isClassDeclaration(d)) {
        extendExpressions = extendExpressions.concat(getExtendsRecursively(d))
      }
    })
  })
  return extendExpressions
}


export const findInterfacesWithPropertyNamed = (decl: ClassDeclaration, memberName: string): InterfaceDeclaration[] =>
  getImplementsAll(decl)
    .map(expr => expr.getType().getSymbolOrThrow().getDeclarations())
    .reduce((a, v) => a.concat(v), [])
    .filter(TypeGuards.isInterfaceDeclaration)
    .filter(d => d.getMembers().find(m => TypeGuards.isPropertyNamedNode(m) && m.getName() === memberName))
    .filter((value, pos, arr) => arr.indexOf(value) === pos) // union




export function getDefaultValueForType(t: Type): string {
  // TODO: this should be recursive in case it references another interface - we can recreate the whole thing recursively... 
  if (!t) {
    return 'null'
  } else if (t.getText() === 'string') {
    return '\'\''
  } else if (t.getText() === 'boolean') {
    return 'false'
  } else if (t.getText() === 'number') {
    return '0'
  } else if (t.isArray()) {
    return '[]'
  } else {
    return 'null'
  }
}
