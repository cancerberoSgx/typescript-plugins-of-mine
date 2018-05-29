import { ParameterDeclaration, ParameterDeclarationStructure, FunctionLikeDeclaration, MethodSignature, Type } from "ts-simple-ast";


export const buildParameterStructure = (p: ParameterDeclaration): ParameterDeclarationStructure => ({
  name: p.getNameOrThrow(),
  hasQuestionToken: p.hasQuestionToken(),
  type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
  isRestParameter: p.isRestParameter(),
  scope: p.hasScopeKeyword() ? p.getScope() : undefined
})


/** fix given function-like declaration parameters and type to implement given signature */
export function fixSignature (decl: FunctionLikeDeclaration, signature: MethodSignature): void {
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
      if (! ( memberParams[i].hasInitializer()||memberParams[i].isOptional())) {
        memberParams[i].remove()
      }
    }
  }
}

/** dirty way of checking if two types are compatible */
export const areTypesEqual = (t1: Type, t2: Type): boolean => t1.getText().replace(/\s+/gi, '') === t2.getText().replace(/\s+/gi, '')
