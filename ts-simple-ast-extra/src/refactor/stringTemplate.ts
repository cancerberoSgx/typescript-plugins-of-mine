import {
  ts,
  Project,
  BinaryExpression,
  Expression,
  NoSubstitutionTemplateLiteral,
  TemplateExpression,
  TypeChecker,
  TypeGuards,
  Node,
  StringLiteral
} from 'ts-morph'
// import * as ts from 'typescript';
// import { findAscendant } from "typescript-ast-util";
// import { CodeFix, CodeFixOptions } from "../codeFixes";
// import { changeQuoteChar, quote, buildRefactorEditInfo } from "../util";

/**

# Description

utilities related to strings:

 * change string quote character
 * go from normal string concatenation to template strings and viceversa
 *

# Example

# TODO

 * TODO: still missing the part that transform from string concat to string templates
 * TaggedTemplateExpression getExpression and remove tag - has some utilitiesfor working with rxjs - perhaps we want to include those here?
 * TODO: recurse on expressions that have templateExpressions descendants
 * allow me to convert string concat (a binaryoperationexpression into a single templateExpression
 * console.log('a'+b+'c') -  change to template or viceversa works funny....
*/

// export class Template2Literal implements CodeFix {

//   name = 'template2Literal'

// const config = {
//   // TODO: so we also transform all expressions recursively from/to templateexpressions - stringliterals
//   recurseOnTemplateExpressions: false,
//   wrapStringConcatenationWithParenthesis: false
// }

type Action = 'changeToLiteral' | 'changeConcatenationToTemplate'

//   predicate(arg: CodeFixOptions): boolean {
//     action = undefined
//     const bin = <ts.BinaryExpression>findAscendant(arg.containingTargetLight, ts.isBinaryExpression, true)
//     const binToken = bin && bin.operatorToken.getText()
//     // heads up we can change just one literal to template or two operands in a binary expression '+' as long as one of them is a string
//     if (ts.isStringLiteral(arg.containingTargetLight) && binToken !== '+') {
//       // action = 'changeToTemplate'  // TODO: not implemented yet so we are not offering yet
//     }
//     else if (ts.isNoSubstitutionTemplateLiteral(arg.containingTargetLight) ||
//       findAscendant<ts.TemplateExpression>(arg.containingTargetLight, ts.isTemplateExpression, true)) {
//       action = 'changeToLiteral'
//     }
//     else if (binToken === '+') {
//       const tc = arg.program.getTypeChecker()
//       if (isString(bin.left, tc) || isString(bin.right, tc)) {
//         action = 'changeConcatenationToTemplate'
//       }
//     }
//     return !!action;
//   }

//   description(arg: CodeFixOptions): string {
//     return action === 'changeToLiteral' ? `Change to string literal` : action === 'changeToTemplate' ? `Change string to template` : `Change concatenation to template`
//   }
// interface Options {
//   // simpleNode: Node
//   // action: Action
//   // simpleProject: Project
//   config: {
//     // TODO: so we also transform all expressions recursively from/to templateexpressions - stringliterals
//     recurseOnTemplateExpressions: boolean,
//     wrapStringConcatenationWithParenthesis: boolean
//   }
//   log: (msg: string) => void
// }

export function stringConcatenationToTemplate(project: Project, node: Node) {
  const tc = project.getProgram().getTypeChecker()
  let innerStringConcatExpr = [node, ...node.getAncestors()].find(
    a =>
      TypeGuards.isBinaryExpression(a) &&
      a.getOperatorToken().getText() === '+' &&
      (isString2(a.getLeft(), tc) || isString2(a.getRight(), tc))
  ) as BinaryExpression

  // now we look the more leftest child to start with it
  let expr = innerStringConcatExpr
  while ((expr = expr.getLeft() as BinaryExpression) && TypeGuards.isBinaryExpression(expr)) {
    innerStringConcatExpr = expr
  }
  if (!innerStringConcatExpr) {
    throw 'changeConcatenationToTemplate aborted - no outerStringConcatExpression found'
  }
  stringConcatExpr2TemplateRecursively(innerStringConcatExpr, tc)
}

type Quote = "'" | '"'
interface Config {
  quote: Quote
  // TODO: so we also transform all expressions recursively from/to templateexpressions - stringliterals
  recurseOnTemplateExpressions: boolean
  wrapStringConcatenationWithParenthesis: boolean
}
export function stringTemplateToConcatenation(project: Project, node: Node, config: Config) {
  const templateExpr =
    TypeGuards.isNoSubstitutionTemplateLiteral(node) || TypeGuards.isTemplateExpression(node)
      ? node
      : node.getFirstAncestorByKind(ts.SyntaxKind.TemplateExpression)
  if (templateExpr && TypeGuards.isTemplateExpression(templateExpr)) {
    templateExprToStringConcat(templateExpr, config.quote, config)
  } else {
    throw 'apply aborted - target node was not a string literal nor a stringtemplate expression or descendant. target node is ' +
      node.getText() +
      ' - kind: ' +
      node.getKindName()
  }
}

function templateExprToStringConcat(
  expr: TemplateExpression | NoSubstitutionTemplateLiteral,
  q: Quote,
  config: Config
) {
  let text: string
  if (TypeGuards.isNoSubstitutionTemplateLiteral(expr)) {
    changeQuoteChar(expr, "'") //TODO: default quotes in case of NoSubstitutionTemplateLiteral ?
    return
  }
  const arr = []
  let textToPush = expr.getHead().getLiteralText()
  if (textToPush) {
    arr.push(quote(textToPush, q))
  }
  expr.getTemplateSpans().forEach(span => {
    // TODO: recurse on expressions that have templateExpressions
    // heads up : Only wrap in paren if there is more than one descentant expression
    const expr = span.getExpression()
    const wrapInParen =
      TypeGuards.isConditionalExpression(expr) ||
      (TypeGuards.isBinaryExpression(expr) &&
        expr.getOperatorToken().getText() === '+' &&
        (TypeGuards.isBinaryExpression(expr.getParent()) ||
          expr.getFirstDescendantByKind(ts.SyntaxKind.BinaryExpression))) ||
      (TypeGuards.isBinaryExpression(expr) && expr.getOperatorToken().getText() !== '+') // TODO: probably there are other cases missing here.

    arr.push((wrapInParen ? '(' : '') + expr.getText() + (wrapInParen ? ')' : ''))
    textToPush = span.getLiteral().getLiteralText()
    if (textToPush) {
      arr.push(quote(textToPush, q))
    }
  })
  text =
    (config.wrapStringConcatenationWithParenthesis ? '( ' : '') +
    arr.join(' + ') +
    (config.wrapStringConcatenationWithParenthesis ? ' )' : '')
  // console.log('replacing with text : ' + text);
  expr.replaceWithText(text)
}

function quote(s: string, q: Quote) {
  const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
  return q + newLiteral + q
}
function changeQuoteChar(node: StringLiteral | NoSubstitutionTemplateLiteral, newQuoteChar: Quote) {
  const newText = quote(node.getLiteralText(), newQuoteChar)
  node.replaceWithText(newText)
}

let exprBuffer: string[] = []

function stringConcatExpr2TemplateRecursively(exprBase: BinaryExpression, tc: TypeChecker) {
  exprBuffer = []
  let expr: Node = exprBase
  stringConcatExpr2Template(exprBase, tc, true)
  while ((expr = expr.getParent()) && TypeGuards.isBinaryExpression(expr)) {
    stringConcatExpr2Template(expr, tc)
  }
  const text = `\`${exprBuffer.join('')}\``
  expr.getFirstChildByKind(ts.SyntaxKind.BinaryExpression)!.replaceWithText(text)
}

function stringConcatExpr2Template(expr: BinaryExpression, tc: TypeChecker, firstTime: boolean = false) {
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

// function isString(expr: ts.Expression, tc: ts.TypeChecker): boolean {
//   const t = tc.getTypeAtLocation(expr)
//   return t.isStringLiteral() ? true : (t.getSymbol()&&t.getSymbol()!.getDeclarations()) ? !!t.getSymbol()!.getDeclarations()!.find(d => tc.getTypeAtLocation(d).isStringLiteral()) : false
// }

function isString2(expr: Expression, tc: TypeChecker): boolean {
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

// export function buildRefactorEditInfo(sourceFile: ts.SourceFile, newText: string, start: number = 0, length: number = 0): ts.RefactorEditInfo {
//   return {
//     edits: [
//       {
//         fileName: sourceFile.fileName,
//         textChanges: [
//           {
//             newText,
//             span: { start, length }
//           }
//         ]
//       }
//     ]
//   }
// }

// }

// export const template2Literal = new Template2Literal()
