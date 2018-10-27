import { ClassDeclaration, InterfaceDeclarationStructure, MethodSignatureStructure, ObjectLiteralExpression, PropertySignatureStructure, Scope, TypeGuards, TypeParameterDeclarationStructure } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant, getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

let target: ts.ClassDeclaration | ts.ObjectLiteralExpression

/**
# Description

Extract current class declaration or object literal expression to a new interface and , if possible, make the original declaration to implement it. 
```
class Fruit {
  color: string
  private creationDate: Date
  foo() {
    return Promise.resolve([['haha']])
  }
}```

will result in 

```
interface IFruit {
  color: string;
  foo(): () => Promise<string[][]>;
  bar(greet: string): Promise<string[]>;
}

class Fruit implements IFruit {
  color: string
  private creationDate: Date
  foo() {
    return Promise.resolve([['haha']])
  }
}```


While in the case of a object literal , there is less metainformation to inffer from : 
```
const obj21 = {
  color: 'hshs',
  creationDate: new Date(),
  foo: () => {
    return Promise.resolve([new Date()])
  },
  bar(greet: string): Promise<string[]> { return null }
}
```

will result in
```
interface Iobj21 {
  color: string;
  creationDate: Date;
  foo(): Promise<Date[]>;
  bar(greet: string): Promise<string[]>;
}
const obj21: Iobj21 = {
  color: 'hshs',
  creationDate: new Date(),
  foo: () => {
    console.log('hello');
    return Promise.resolve([new Date()])
  },
  bar(greet: string): Promise<string[]> { return null }
}
```

# TODO

 * config 
 * if the class already implements an interface, we shouldn't extract those methods. 
 * what about methods of super classes ? this behavior could be configurable
 * put the interface in a separate file and add an import?
 * enhancement: if user selects only some methods, we should only extract those.
 * properties declared as constructor scoped params 

*/
export const extractInterface: CodeFix = {

  name: 'extractInterface',

  config: {
    // TODO: 
    copyJsdoc: true,
    // TODO: is true it will remove jsdocs from source class for those members which jsdoc has been copied to the interface member signatures
    removeCopiedJsdocFromClass: false
  },

  predicate: (options: CodeFixOptions): boolean => {
    target = findAscendant<ts.ClassDeclaration | ts.ObjectLiteralExpression>(options.containingTargetLight, a => ts.isClassDeclaration(a) || ts.isObjectLiteralExpression(a), true)
    return !!target
  },

  description: (options: CodeFixOptions): string => `Extract interface from outer ${getKindName(target)}`,

  apply: (options: CodeFixOptions) => {
    const source = options.simpleNode.getAncestors().find(a => TypeGuards.isClassDeclaration(a) || TypeGuards.isObjectLiteralExpression(a))
    if (!source) {
      options.log('not applying since cannot node.getAncestors().find(a => TypeGuards.isClassDeclaration(a) || TypeGuards.isObjectLiteralExpression(a))')
    }
    else if (TypeGuards.isClassDeclaration(source)) {
      fromClassDeclaration(source)
    } else if (TypeGuards.isObjectLiteralExpression(source)) {
      fromObjectLiteral(source)
    }
  }
}

function fromClassDeclaration(source: ClassDeclaration) {
  const interfaceName = `I${source.getName() || 'UnnamedInterface'}`
  const structure: InterfaceDeclarationStructure = {
    docs: source.getJsDocs().map(doc=>doc.getInnerText()) || [`TODO: Document me`],
    name: interfaceName,
    properties: source.getProperties().filter(p => p.getScope() === Scope.Public).map(p => ({
      docs: p.getJsDocs().map(doc=>doc.getInnerText()) || [`TODO: Document me`],
      name: p.getName(),
      type: p.getTypeNode() ? p.getTypeNode().getText() : p.getType() ? p.getType().getText() : undefined,
      questionToken: p.hasQuestionToken(),
      isReadonly: p.isReadonly(),
      initializer: p.getInitializer() ? p.getInitializer().getText() : undefined
    } as PropertySignatureStructure)),
    methods: source.getMethods().filter(p => p.getScope() === Scope.Public).map(m => ({
      docs: m.getJsDocs().map(doc=>doc.getInnerText()) || [`TODO: Document me`],
      name: m.getName(),
      returnType: m.getReturnTypeNode() ? m.getReturnTypeNode().getText() : m.getType() ? m.getType().getText() : undefined,
      // typeParameters: m. //TODO
      parameters: m.getParameters().map(p => ({
        name: p.getName(),
        type: p.getTypeNode() ? p.getTypeNode().getText() : p.getType() ? p.getType().getText() : undefined,
        questionToken: p.hasQuestionToken(),
        initializer: p.getInitializer() ? p.getInitializer().getText() : undefined
      }))
    } as MethodSignatureStructure)),
    typeParameters: source.getTypeParameters() && source.getTypeParameters().map(tp => ({
      name: tp.getName(),
      constraint: tp.getConstraint() && tp.getConstraint().getText(),
      default: tp.getDefault() && tp.getDefault().getText()
    } as TypeParameterDeclarationStructure))
  };
  source.addImplements(interfaceName)
  source.getSourceFile().insertInterface(source.getChildIndex(), structure)
}

function fromObjectLiteral(source: ObjectLiteralExpression) {
  const interfaceName = `I${source.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration) && source.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration).getName() || 'UnnamedInterface'}`
  let initializerProp, initializerMethod
  const structure: InterfaceDeclarationStructure = {
    name: interfaceName,
    properties: source.getProperties().filter(TypeGuards.isPropertyAssignment).filter(p => (initializerProp = p.getInitializer()) && !TypeGuards.isSignaturedDeclaration(initializerProp)).map(p => ({
      name: p.getName(),
      type: p.getType() ? p.getType().getText() : 'undefined',
    } as PropertySignatureStructure)),
    methods: source.getProperties().filter(TypeGuards.isPropertyAssignment).filter(p => (initializerMethod = p.getInitializer()) && TypeGuards.isSignaturedDeclaration(initializerMethod)).map(m => ({
      name: m.getName(),
      returnType: initializerMethod.getReturnTypeNode() ? initializerMethod.getReturnTypeNode().getText() : initializerMethod.getReturnType() ? initializerMethod.getReturnType().getText() : undefined,
      parameters: initializerMethod.getParameters().map(p => ({
        name: p.getName(),
        type: p.getTypeNode() ? p.getTypeNode().getText() : p.getType() ? p.getType().getText() : undefined,
        questionToken: p.hasQuestionToken(),
        initialize: initializerMethod ? initializerMethod.getText() : undefined
      }))
    } as MethodSignatureStructure))
      .concat(source.getProperties().filter(TypeGuards.isMethodDeclaration).map(m => ({
        name: m.getName(),
        returnType: m.getReturnTypeNode() ? m.getReturnTypeNode().getText() : m.getReturnType() ? m.getReturnType().getText() : undefined,
        parameters: m.getParameters().map(p => ({
          name: p.getName(),
          type: p.getTypeNode() ? p.getTypeNode().getText() : p.getType() ? p.getType().getText() : undefined,
          questionToken: p.hasQuestionToken(),
          initializer: p.getInitializer() ? p.getInitializer().getText() : undefined
        }))
      })))
      .filter((p, i, arr) => arr.indexOf(p) === i), // de duplicating just in case
  };
  let parent = source.getParent()
  if (TypeGuards.isVariableDeclaration(parent)) {
    parent.setType(interfaceName)
  }
  source.getSourceFile().insertInterface(Math.max(0, source.getChildIndex() - 2), structure)
}
