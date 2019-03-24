import { TypeGuards, ConstructorDeclarationStructure, ClassDeclaration , StatementedNode , InterfaceDeclarationStructure, SyntaxKind, MethodSignatureStructure, PropertySignatureStructure} from 'ts-morph';
import { getImplementsAll } from '../types';

export function extractInterface(
  node: ClassDeclaration,
  dest: StatementedNode = node.getSourceFile(),
  interfaceName: string = node.getName() ? 'I' + node.getName() : 'IAnonymousClass',
  removeDocs = false
) {
  const structure: InterfaceDeclarationStructure = {
    name: interfaceName,
    methods: [],
    properties: [],
    constructSignatures: [],
    callSignatures: [],
    typeParameters:
      node.getTypeParameters() &&
      node.getTypeParameters().map(tp => ({
        name: tp.getName(),
        constraint: tp.getConstraint() && tp.getConstraint()!.getText(),
        default: tp.getDefault() && tp.getDefault()!.getText()
      })),
    extends: getImplementsAll(node).map(i => i.getText()),
    docs: node.getJsDocs().length ? node.getJsDocs().map(d => d.getStructure()) : ['TODO: Document']
  }
  node
    .getMembers()
    .filter(p => !p.hasModifier(SyntaxKind.ProtectedKeyword) && !p.hasModifier(SyntaxKind.PrivateKeyword))
    .forEach(member => {
      if (removeDocs) {
        member.getJsDocs().forEach(d => d.remove())
      }
      if (TypeGuards.isMethodDeclaration(member)) {
        const methodSignature: MethodSignatureStructure = {
          typeParameters: member.getTypeParameters().map(p => p.getStructure()),
          docs: member.getJsDocs().length ? member.getJsDocs().map(d => d.getStructure()) : ['TODO: Document'],
          hasQuestionToken: member.hasQuestionToken(),
          name: member.getName(),
          parameters: member.getParameters().map(p => p.getStructure()),
          returnType: member
            .getReturnType()
            .getBaseTypeOfLiteralType()
            .getText()
        }
        structure.methods!.push(methodSignature)
      }
      if (TypeGuards.isPropertyDeclaration(member)) {
        const propertySignature: PropertySignatureStructure = {
          docs: member.getJsDocs().length ? member.getJsDocs().map(d => d.getStructure()) : ['TODO: Document'],
          hasQuestionToken: member.hasQuestionToken(),
          name: member.getName(),
          type: member
            .getType()
            .getBaseTypeOfLiteralType()
            .getText()
        }
        structure.properties!.push(propertySignature)
      }
      if (TypeGuards.isConstructorDeclaration(member)) {
        const constructorSignature: ConstructorDeclarationStructure = {
          typeParameters: member.getTypeParameters().map(p => p.getStructure()),
          docs: member.getJsDocs().length ? member.getJsDocs().map(d => d.getStructure()) : ['TODO: Document'],
          parameters: member.getParameters().map(p => p.getStructure()),
          returnType: member
            .getReturnType()
            .getBaseTypeOfLiteralType()
            .getText()
        }
        structure.constructSignatures!.push(constructorSignature)
      }
    })

  node.getImplements().forEach((I, i) => node.removeImplements(i))
  node.addImplements(
    `${structure.name}${
      node.getTypeParameters().length
        ? node
            .getTypeParameters()
            .map(t => `<${t.getText()}>`)
            .join(', ')
        : ''
    }`
  )
  if (removeDocs) {
    node.getJsDocs().forEach(d => d.remove())
  }
  dest.addInterface(structure)
}
