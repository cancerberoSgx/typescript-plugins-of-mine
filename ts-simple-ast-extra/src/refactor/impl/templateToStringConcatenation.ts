import { Node, NoSubstitutionTemplateLiteral, StringLiteral, ts, TypeGuards } from 'ts-morph'

type Quote = '\'' | '"'

interface Config {
  quote?: Quote
  wrapStringConcatenationWithParenthesis?: boolean
  dontThrowOnNotFound?: boolean
}

/**
 * Transform all template expressions to string concatenations in given node descendants.
 */
export function templatesToStringConcatenations(node: Node, config: Config = {}) {
  let c: Node | undefined
  while ((c = node.getFirstDescendant(d => !!templateToStringConcatenationFind(d)))) {
    templateToStringConcatenation(c, config, true)
  }
}

function templateToStringConcatenationFind(node: Node) {
  return TypeGuards.isNoSubstitutionTemplateLiteral(node) || TypeGuards.isTemplateExpression(node)
    ? node
    : node.getFirstAncestorByKind(ts.SyntaxKind.TemplateExpression)
}
/**
 * will transform node's or first ancestor template expression into a string concatenation expression.
 */
export function templateToStringConcatenation(node: Node, config?: Config, dontFind = false) {
  config = { ...{ quote: '"', wrapStringConcatenationWithParenthesis: false }, ...(config || {}) }
  const templateExpr = dontFind ? node : templateToStringConcatenationFind(node)
  if (templateExpr && TypeGuards.isTemplateExpression(templateExpr)) {
    let text: string
    if (TypeGuards.isNoSubstitutionTemplateLiteral(templateExpr)) {
      changeQuoteChar(templateExpr, config.quote!)
      return
    }
    const arr = []
    let textToPush = templateExpr.getHead().getLiteralText()
    if (textToPush) {
      arr.push(quote(textToPush, config.quote!))
    }
    templateExpr.getTemplateSpans().forEach(span => {
      // TODO: recurse on expressions that have templateExpressions
      // HEADS UP: Only wrap in paren if there is more than one descendant expression
      const expr = span.getExpression()
      const wrapInParen =
        TypeGuards.isConditionalExpression(expr) ||
        (TypeGuards.isBinaryExpression(expr) &&
          expr.getOperatorToken().getText() === '+' &&
          (expr.getParent() && TypeGuards.isBinaryExpression(expr.getParent()!) ||
            expr.getFirstDescendantByKind(ts.SyntaxKind.BinaryExpression))) ||
        // TODO: probably there are other cases missing here.
        (TypeGuards.isBinaryExpression(expr) && expr.getOperatorToken().getText() !== '+')

      arr.push((wrapInParen ? '(' : '') + expr.getText() + (wrapInParen ? ')' : ''))
      textToPush = span.getLiteral().getLiteralText()
      if (textToPush) {
        arr.push(quote(textToPush, config!.quote!))
      }
    })
    text =
      (config!.wrapStringConcatenationWithParenthesis ? '( ' : '') +
      arr.join(' + ') +
      (config!.wrapStringConcatenationWithParenthesis ? ' )' : '')
    templateExpr.replaceWithText(text)
  } else {
    throw 'No template expression found on given node or its ancestors. Given node was: ' +
    node.getText() +
    ' - kind: ' +
    node.getKindName()
  }
}

function quote(s: string, q: Quote) {
  const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
  return q + newLiteral + q
}

function changeQuoteChar(node: StringLiteral | NoSubstitutionTemplateLiteral, newQuoteChar: Quote) {
  const newText = quote(node.getLiteralText(), newQuoteChar)
  node.replaceWithText(newText)
}
