import { BinaryExpression, Expression, Node, ts, TypeChecker, TypeGuards } from 'ts-morph'

/**
 * Transform all string concatenation expressions found in node and its descendants to string template expressions.
 */
export function stringConcatenationsToTemplateExpressions(node: Node, tc: TypeChecker) {
  let c: Node | undefined
  while ((c = node.getFirstDescendant(d => stringConcatenationNodePredicate(d, tc)))) {
    stringConcatenationToTemplateExpression(c, tc)
  }
}

/**
 * Will transform node's ancestors binary expression which operator token is '+' and its left and right expressions are strings to a template expression.
 */
export function stringConcatenationToTemplateExpression(node: Node, tc: TypeChecker) {
  let innerStringConcatExpr = [node, ...node.getAncestors()].find(n =>
    stringConcatenationNodePredicate(n, tc)
  ) as BinaryExpression
  // now we look the more leftest child to start with it
  let expr = innerStringConcatExpr
  while (expr && (expr = expr.getLeft() as BinaryExpression) && TypeGuards.isBinaryExpression(expr)) {
    innerStringConcatExpr = expr
  }
  if (!innerStringConcatExpr) {
    throw 'changeConcatenationToTemplate aborted - no outerStringConcatExpression found'
  }
  stringConcatenation2TemplateExpressionRecursively(innerStringConcatExpr, tc)
}

function stringConcatenationNodePredicate(a: Node, tc: TypeChecker) {
  return (
    TypeGuards.isBinaryExpression(a) &&
    a.getOperatorToken().getText() === '+' &&
    (isString(a.getLeft(), tc) || isString(a.getRight(), tc))
  )
}

let exprBuffer: string[] = []

function stringConcatenation2TemplateExpressionRecursively(exprBase: BinaryExpression, tc: TypeChecker) {
  exprBuffer = []
  let expr: Node = exprBase
  stringConcatenation2TemplateExpression(exprBase, tc, true)
  while ((expr = expr.getParent()) && TypeGuards.isBinaryExpression(expr)) {
    stringConcatenation2TemplateExpression(expr, tc)
  }
  const text = `\`${exprBuffer.join('')}\``
  expr.getFirstChildByKind(ts.SyntaxKind.BinaryExpression)!.replaceWithText(text)
}

function stringConcatenation2TemplateExpression(expr: BinaryExpression, tc: TypeChecker, firstTime: boolean = false) {
  let leftText: string = expression2String(expr.getLeft())
  let rightText: string = expression2String(expr.getRight())
  if (firstTime && leftText) {
    exprBuffer.push(leftText)
  }
  if (rightText) {
    exprBuffer.push(rightText)
  }
}

function expression2String(expr: Expression): string {
  if (TypeGuards.isParenthesizedExpression(expr)) {
    expr = expr.getExpression()
  }
  if (TypeGuards.isStringLiteral(expr)) {
    return expr.getLiteralText()
  } else {
    return '${' + expr.getText() + '}'
  }
}

// TODO: do this better, don't think passing tc is necessary.
function isString(expr: Expression, tc: TypeChecker): boolean {
  const t = tc.getTypeAtLocation(expr)
  return t.isStringLiteral()
    ? true
    : t.getSymbol()
      ? !!t
        .getSymbol()!
        .getDeclarations()
        .find(d => tc.getTypeAtLocation(d).isStringLiteral())
      : false
}
