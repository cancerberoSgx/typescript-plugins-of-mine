import * as ts from 'typescript';
import { findAscendant, findChild, getKindName } from "typescript-ast-util";
import { Postfix, PostfixConfig, PostfixExecuteOptions, PostfixPredicateOptions } from "./types";

export class ConsolePostfixConfig implements PostfixConfig {
  constructor(name: string, type: 'log' | 'error' | 'warn') {
    this.name = name
    this.type = type
  }
  name: string
  kind: ts.ScriptElementKind = ts.ScriptElementKind.unknown
  kindModifiers: string
  sortText: string
  insertText?: string
  replacementSpan?: ts.TextSpan
  hasAction?: true
  source?: string
  isRecommended?: true
  type: 'log' | 'error' | 'warn'
}

const isExpression = node => getKindName(node).endsWith('Expression') || node.kind === ts.SyntaxKind.Identifier || getKindName(node).endsWith('Literal')

const isNotExpression = node => !isExpression(node)

export class ConsolePostFix implements Postfix {
  name: 'Wrapps expression with console.log call'
  description: 'Wrapps expression with console.log call'

  constructor(public config: ConsolePostfixConfig) { }

  getInsertText(opts: PostfixPredicateOptions): string {
    const s = `console.${this.config.type}(`
    const target2 = findAscendant(opts.target, ts.isPropertyAccessExpression, true)
    if (!target2) {
      opts.log('Console postfix doing nothing because !findAscendant(target2, ts.isPropertyAccessExpression,true)' + getKindName(opts.target))
      return
    }

    const targetExpression = findChild(findAscendant(target2, isNotExpression, true), isExpression, false)

    if (targetExpression.getFullText().length < s.length) {
      const start = targetExpression.getWidth() - opts.target.getWidth() - 1
      const end = targetExpression.getWidth() - 1
      return         s.substring(start, end)
    }
    return opts.file.getFullText().substring(opts.position - s.length - 1 - opts.target.getWidth(), opts.position - 1 - s.length) 
  }

  predicate(opts: PostfixPredicateOptions): boolean {
    return true
  }

  execute(opts: PostfixExecuteOptions): string {
    const { program, fileName, position, target, log } = opts

    const sourceFile = program.getSourceFile(fileName)
    const target2 = findAscendant(target, ts.isPropertyAccessExpression, true)
    if (!target2) {
      log('Console postfix doing nothing because !findAscendant(target2, ts.isPropertyAccessExpression,true)' + getKindName(opts.target))
      return
    }

    const targetExpression = findChild(findAscendant(target2, isNotExpression, true), isExpression, false)
    const allText = sourceFile.getFullText()
    const allNewText = allText.substring(0, targetExpression.getFullStart()) +
      ' console.' + this.config.type + '(' +
      allText.substring(targetExpression.getFullStart(), target.getFullStart() - 1) + ')' +
      allText.substring(targetExpression.end, sourceFile.end) +
      ''
    return allNewText
  }

}
