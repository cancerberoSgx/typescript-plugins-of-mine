import { TypeGuards, ClassDeclaration, PropertySignature, ParameterDeclaration, ParameterDeclarationSpecificStructure, MethodDeclarationSpecificStructure, MethodSignatureStructure, MethodDeclarationStructure, ParameterDeclarationStructure, PropertyDeclaration, InterfaceDeclaration } from "ts-simple-ast";

export function methodDelegateOnInterface(interfaceDeclaration: InterfaceDeclaration, property: PropertySignature | string) {
  //TODO: we do only first level - by configuration we could do it recursively 
  const propertySignature = typeof property === 'string' ? interfaceDeclaration.getProperty(property) : property
  const decl = propertySignature.getType().getSymbol().getDeclarations()[0]
  if (TypeGuards.isClassDeclaration(decl)) {
    const methods = getClassMethodStructures(decl, propertySignature.getName())
    interfaceDeclaration.addMethods(methods)
  }
  if (TypeGuards.isInterfaceDeclaration(decl)) {
      interfaceDeclaration.addMethods(getInterfaceMethodStructures(decl))
  }
}

export function methodDelegateOnClass(classDeclaration: ClassDeclaration, property: PropertyDeclaration | string) {
  //TODO: we do only first level - by configuration we could do it recursively 
  const propertyDeclaration = typeof property === 'string' ? classDeclaration.getProperty(property) : property
  const decl = propertyDeclaration.getType().getSymbol().getDeclarations()[0]
  if (TypeGuards.isClassDeclaration(decl)) {
    classDeclaration.addMethods(getClassMethodStructures(decl, propertyDeclaration.getName()))
  }
  if (TypeGuards.isInterfaceDeclaration(decl)) {
      classDeclaration.addMethods(getInterfaceMethodStructures(decl))
  }
}



function getInterfaceMethodStructures(decl: InterfaceDeclaration): MethodSignatureStructure[] {

  return decl.getMethods().map(method => ({
    name: method.getName(),
    hasQuestionToken: method.hasQuestionToken(),
    returnType: method.getReturnTypeNodeOrThrow().getText(),
    docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
    typeParameters: method.getTypeParameters().map(p => ({
      name: p.getName(),
      constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
    })),
    parameters: method.getParameters().map(p => ({
      name: p.getNameOrThrow(),
      hasQuestionToken: p.hasQuestionToken(),
      type: p.getTypeNodeOrThrow().getText()
    }))
  }))

}
export function getClassMethodStructures(decl: ClassDeclaration, memberName: string): MethodDeclarationStructure[] {

  return decl.getInstanceMethods().map(method => ({
    name: method.getName(),
    returnType: method.getReturnTypeNode() == null ? undefined : method.getReturnTypeNodeOrThrow().getText(),
    docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
    scope: method.hasScopeKeyword() ? method.getScope() : undefined,
    typeParameters: method.getTypeParameters().map(p => ({
      name: p.getName(),
      constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
    })),
    parameters: method.getParameters().map(p => ({
      name: p.getNameOrThrow(),
      hasQuestionToken: p.hasQuestionToken(),
      type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
      isRestParameter: p.isRestParameter(),
      scope: p.hasScopeKeyword() ? p.getScope() : undefined
    })),
    bodyText: `return 1; `//this.${memberName}(${method.getParameters().map(p=>p.getName()).join(', ')}); `
  }))
}
