import { VariableDeclarationList, TypeGuards, VariableStatementStructure, SyntaxKind } from 'ts-morph'

export function splitVariableDeclaration(node: VariableDeclarationList) {
  // const varDeclList = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclarationList)
  // if (!varDeclList || !TypeGuards.isVariableDeclarationList(varDeclList)) {
  // arg.log('not apply because no splitVariableDeclarationList ancestor was found')
  // return
  // }

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
    // const start = variableStatement.getStart()
    // const length = variableStatement.getFullWidth()// + 2 // TODO: don't know why I have to do +2 in order to work OK
    // const variableStatementNodes = container.insertVariableStatements(variableStatement.getChildIndex(), variableStatements)
    container.insertVariableStatements(variableStatement.getChildIndex(), variableStatements)
    variableStatement.remove()
    // const code = variableStatementNodes.map(s => s.getText()).join('\n') // TODO: respect formatOptions
    // return buildRefactorEditInfo(arg.sourceFile, code, start, length)
  } else {
    throw `cannot find parent's parent Block or SourceFile for node ${node.getKindName()} - parent's parent kind is ${container.getKindName()}`
  }
}
