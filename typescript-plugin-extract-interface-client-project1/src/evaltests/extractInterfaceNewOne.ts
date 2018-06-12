/**
 * a fruit is a living thing, produced by trees
 */
class Fruit extends LivingThing {
  /**
   * use undefined for 100% transparency
   */
  color: string|undefined
  /** shouldn't be exported */
  private creationDate: Date
  /**
   * will resolve when it's worthwhile
   */
  foo() {
    return Promise.resolve([['smile']])
  }
  /**
   * @param greet the greeting to show in all user's screens 
   */
  bar(greet: string): Promise<string[]> { return null }
}

const obj21 = {
  color: 'hshs',
  creationDate: new Date(),
  foo: () => Promise.resolve([new Date()]),
  bar(greet: string): Promise<string[]> { return null }
}


import { ClassDeclaration, InterfaceDeclarationStructure, MethodSignatureStructure, ObjectLiteralExpression, PropertySignatureStructure, Scope, TypeGuards, TypeParameterDeclarationStructure } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;


function fromClassDeclaration(source: ClassDeclaration) {
  const interfaceName = `I${source.getName() || 'UnnamedInterface'}`
  const structure: InterfaceDeclarationStructure = {
    name: interfaceName,
    docs: source.getJsDocs().map(doc=>doc.getText()) || [`/**\n * Document me\n */`],
    properties: source.getProperties().filter(p => p.getScope() === Scope.Public).map(p => ({
      name: p.getName(),
      type: p.getTypeNode() ? p.getTypeNode().getText() : p.getType() ? p.getType().getText() : undefined,
      questionToken: p.hasQuestionToken(),
      isReadonly: p.isReadonly(),
      initializer: p.getInitializer() ? p.getInitializer().getText() : undefined
    } as PropertySignatureStructure)),
    methods: source.getMethods().filter(p => p.getScope() === Scope.Public).map(m => ({
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


let print
/**
 * # Description
 * 
 * will extract interface from class declaration or object literal ancestor making it implement the new interface 
 */
function evaluateMe() {
  print = c.print

  const position = 234
  const sourceFile = c.project.createSourceFile(`tmp/extractInterfaceNewOne${Date.now()}.ts`, c.node.getSourceFile().getText())

  const node = sourceFile.getDescendantAtPos(position)

  const source = node.getAncestors().find(a => TypeGuards.isClassDeclaration(a) || TypeGuards.isObjectLiteralExpression(a))
  if (!source) {
    print('not applying since cannot node.getAncestors().find(a => TypeGuards.isClassDeclaration(a) || TypeGuards.isObjectLiteralExpression(a))')
    return
  }
  else if (TypeGuards.isClassDeclaration(source)) {
    fromClassDeclaration(source)
  } else if (TypeGuards.isObjectLiteralExpression(source)) {
    fromObjectLiteral(source)
  }

  print(sourceFile.getText().substring(0, Math.min(sourceFile.getText().length, 800)))

  sourceFile.deleteImmediatelySync()

}
