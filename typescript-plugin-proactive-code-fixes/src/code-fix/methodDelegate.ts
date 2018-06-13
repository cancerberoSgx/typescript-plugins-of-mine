import { now } from "hrtime-now";
import { ClassDeclaration, InterfaceDeclaration, MethodDeclarationStructure, MethodSignatureStructure, PropertyDeclaration, PropertySignature, Scope, TypeGuards } from "ts-simple-ast";
import * as ts from 'typescript';
import { findAscendant } from "typescript-ast-util";
import { CodeFix, CodeFixOptions } from "../codeFixes";

/**

# Description

From anywhere inside a class' property declaration or an interface's property signature user will be suggested with the refactor "Delegate methods in property "foo". If executed it will create the same methods of property foo type delegating the implementation on them

# Example
```
interface Speedometer {
  getCurrentSpeed(): number
  rotate(force: number): { counterclockwise: boolean, h: number }
  m(): number
  go(to: { x: number, y: number }): Promise<void>
}
class Fiat1 {
  speedometer: Speedometer // suggested from anywhere inside the property declaration
}
```
the result of accepting this refactor standing on property `Fiat1.speedometer` is: 

```
class Fiat1 {
  speedometer: Speedometer
  public getCurrentSpeed(): number {
    return this.speedometer.getCurrentSpeed();
  }
  public rotate(force: number): { counterclockwise: boolean, h: number } {
    return this.speedometer.rotate(force);
  }
  public m(): number {
    return this.speedometer.m();
  }
  public go(to: { x: number, y: number }): Promise<void> {
    return this.speedometer.go(to);
  }
}
```

# TODO

 * what happen when property type is a class ? in that case what happens with non method members like properties and getter/setters ? 
 * undefined check for properties that can be undefined 
 * config
 * check these comments: TODO: we do only first level - by configuration we could do it recursively 
 * support object literal expressions ?

*/

export class MethodDelegate implements CodeFix {

  name = 'methodDelegate'

  config = {
    // TODO: self-explanatory
    delegateOnlyOnNonUndefinedProperties: false,
    // TODO:  self-explanatory
    checkForUndefinedInDelegationImplementation: false
  }

  propertyDeclaration: ts.PropertyDeclaration;

  predicate(arg: CodeFixOptions): boolean {
    this.propertyDeclaration = findAscendant<ts.PropertyDeclaration>(arg.containingTargetLight, a => ts.isPropertyDeclaration(a) || ts.isPropertySignature(a), true)
    return !!findAscendant(this.propertyDeclaration, a => ts.isClassDeclaration(a) || ts.isInterfaceDeclaration(a), true)
  }

  description(arg: CodeFixOptions): string {
    return `Delegate methods to property ${this.propertyDeclaration.name.getText()}`
  }

  apply(arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void {
    const propertyDeclaration = (TypeGuards.isPropertyDeclaration(arg.simpleNode) || TypeGuards.isPropertySignature(arg.simpleNode)) ? arg.simpleNode : arg.simpleNode.getAncestors().find(a => TypeGuards.isPropertyDeclaration(a) || TypeGuards.isPropertySignature(a))
    if (!propertyDeclaration) {
      arg.log(`apply aborted because no ancestor PropertyDeclaration can be found from  ${arg.simpleNode.getKindName()}`)
      return
    }
    const typeDeclaration = propertyDeclaration.getAncestors().find(d => TypeGuards.isClassDeclaration(d) || TypeGuards.isInterfaceDeclaration(d))
    if (TypeGuards.isInterfaceDeclaration(typeDeclaration) && TypeGuards.isPropertySignature(propertyDeclaration)) {
      methodDelegateOnInterface(typeDeclaration, propertyDeclaration)
    }
    else if (TypeGuards.isClassDeclaration(typeDeclaration) && TypeGuards.isPropertyDeclaration(propertyDeclaration)) {
      methodDelegateOnClass(typeDeclaration, propertyDeclaration)
    }
    else {
      arg.log(`apply aborted because typeguards didn't applied for typeDeclaration:${typeDeclaration.getKindName()}, propertyDeclaration:${propertyDeclaration.getKindName()}`)
    }
  }
}

export const methodDelegate = new MethodDelegate()

function methodDelegateOnInterface(interfaceDeclaration: InterfaceDeclaration, property: PropertySignature | string) {
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

function methodDelegateOnClass(classDeclaration: ClassDeclaration, property: PropertyDeclaration | string) {
  //TODO: we do only first level - by configuration we could do it recursively 
  const propertyDeclaration = typeof property === 'string' ? classDeclaration.getProperty(property) : property
  const decl = propertyDeclaration.getType().getSymbol().getDeclarations()[0]
  if (TypeGuards.isClassDeclaration(decl) || TypeGuards.isInterfaceDeclaration(decl)) {
    classDeclaration.addMethods(getClassMethodStructures(decl, propertyDeclaration.getName()))
  }
  else {
    //  TODO: log
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
function getClassMethodStructures(decl: ClassDeclaration | InterfaceDeclaration, memberName: string): MethodDeclarationStructure[] {
  if (TypeGuards.isClassDeclaration(decl)) {
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
      bodyText: `var a = 1; return Math.random() as any`//TODO! implement ! this.${memberName}(${method.getParameters().map(p=>p.getName()).join(', ')}); `
    }))
  }
  else if (TypeGuards.isInterfaceDeclaration(decl)) {
    return decl.getMethods().map(method => ({
      name: method.getName(),
      returnType: method.getReturnTypeNode() == null ? undefined : method.getReturnTypeNodeOrThrow().getText(),
      docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
      scope: Scope.Public,//   method.hasScopeKeyword() ? method.getScope() : undefined,
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
      bodyText: `return this.${memberName}.${method.getName()}(${method.getParameters().map(p => p.getName()).join(', ')}); `
    }))


  }
  // const methods: MethodDeclaration[]|MethodSignature[] = TypeGuards.isClassDeclaration(decl) ? decl.getInstanceMethods() : TypeGuards.isInterfaceDeclaration(decl) ? decl.getMethods() : []

}
