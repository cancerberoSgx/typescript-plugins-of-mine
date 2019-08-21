import { Node, SyntaxKind, TypeGuards, VariableDeclarationList, VariableStatementStructure } from 'ts-morph'

/**
 * Replace given node's VariableDeclarationList descendants with individual variable declaration statements one for each variable.
 * It will add types if variables in variable declaration list don't declare them
 */
export function splitVariableDeclarations(node: Node) {
  let c: VariableDeclarationList | undefined
  while (
    (c = node.getFirstDescendant(
      d => TypeGuards.isVariableDeclarationList(d) && d.getDeclarations().length > 1
    ) as VariableDeclarationList)
  ) {
    splitVariableDeclaration(c)
  }
}

/**
 * Replace given VariableDeclarationList node with variable declaration statements one for each variable.
 * It will add types if variables in variable declaration list don't declare them
 */
export function splitVariableDeclaration(node: VariableDeclarationList) {
  const container = node.getParent().getParent()
  if (TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container)) {
    const variableStatements = node.getDeclarations().map(d => ({
      declarationKind: node.getDeclarationKindKeyword().getText(),
      declarations: [
        {
          hasExclamationToken: d.hasExclamationToken(),
          name: d.getName(),
          type: d.getTypeNode() ? d.getTypeNode()!.getText() : d.getType().getText(),
          initializer: d.getInitializer() ? d.getInitializer()!.getText() : ''
        }
      ]
    })) as VariableStatementStructure[]
    const variableStatement = node.getFirstAncestorByKind(SyntaxKind.VariableStatement)
    if (!variableStatement) {
      throw 'cannot find VariableStatement ancestor for node ' + node.getKindName() + ' - ' + node.getText()
    }
    container.insertVariableStatements(variableStatement.getChildIndex(), variableStatements)
    variableStatement.remove()
  } else {
    throw `cannot find parent's parent Block or SourceFile for node ${node.getKindName()} - parent's parent kind is ${container.getKindName()}`
  }
}
