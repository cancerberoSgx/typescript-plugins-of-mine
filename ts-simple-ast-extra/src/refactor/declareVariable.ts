import { Block, Diagnostic, Identifier, Node, Statement, SyntaxKind, TypeChecker, TypeGuards } from 'ts-morph'
/**
 * Will declare a variable or function on every identifier with error codes 2552 or 2304
 */
export function declareVariables(
  node: Node,
  tc: TypeChecker,
  diagnostics: Diagnostic[] = node.getSourceFile().getPreEmitDiagnostics()
) {
  let c: Identifier | undefined
  while (
    (c = node.getFirstDescendant(
      desc =>
        TypeGuards.isIdentifier(desc) &&
        !!diagnostics.find(d => (d.getCode() === 2304 || d.getCode() === 2552) && d.getStart() === desc.getStart())
    ) as Identifier)
  ) {
    declareVariable(c, tc, diagnostics)
    diagnostics = node.getSourceFile().getPreEmitDiagnostics()
  }
}

/**
 * Will declare a variable or function on given identifier with error codes 2552 or 2304
 */
export function declareVariable(
  node: Identifier,
  tc: TypeChecker,
  diagnostics: Diagnostic[] = node.getSourceFile().getPreEmitDiagnostics()
) {
  if (!diagnostics.find(d => (d.getCode() === 2304 || d.getCode() === 2552) && d.getStart() === node.getStart())) {
    throw 'cannot declare variable if there is no 2304 or 2552 error'
  }
  const parent = node.getParent()
  const container = parent.getFirstAncestorByKind(SyntaxKind.Block) || node.getSourceFile()
  const statementAncestor = parent.getAncestors().find(a => a.getParent() === container) as Statement
  if (
    TypeGuards.isIdentifier(node) &&
    TypeGuards.isCallExpression(parent) &&
    TypeGuards.isIdentifier(parent.getExpression()) &&
    parent.getExpression().getText() === node.getText()
  ) {
    const functionName = node.getText()
    const functionArguments = parent.getArguments().map((a, index) => {
      const type = tc
        .getTypeAtLocation(a)
        .getBaseTypeOfLiteralType()
        .getText()
      return `arg${index}: ${type}`
    })
    const t = tc.getContextualType(node.getFirstAncestorByKindOrThrow(SyntaxKind.CallExpression))
    const returnType = t ? t.getText() : 'any'
    const functionText = `
function ${functionName}(${functionArguments.join(', ')}): ${returnType} {
  throw new Error('Not Implemented');
}
`
    if (!TypeGuards.isPropertyAccessExpression(parent.getChildAtIndex(0))) {
      // it's function call and the function is not a member i.e bar()
      ; (statementAncestor.getParent()! as Block).insertStatements(statementAncestor.getChildIndex(), functionText)
    } else {
      // it's a function call and the function is a member, i.e : foo.bar() - this is tackled by another fix: declareMember
      // TODO
    }
  } else {
    // its non function variable
    if (
      TypeGuards.isBinaryExpression(node.getParentOrThrow()) &&
      TypeGuards.isStatement(node.getParentOrThrow().getParentOrThrow())
    ) {
      // is an expression like a=1 we only preppend 'let '
      ; (statementAncestor.getParent() as Block).insertStatements(
        statementAncestor.getChildIndex(),
        `let ${node.getParent()!.getText()}`
      )
      statementAncestor.remove()
    } else {
      // other wise we create a new statement 'let a' at the top
      // TODO: test
      ; (statementAncestor.getParent()! as Block).insertStatements(0, `let ${(node as Identifier).getText()};\n`)
    }
  }
}
