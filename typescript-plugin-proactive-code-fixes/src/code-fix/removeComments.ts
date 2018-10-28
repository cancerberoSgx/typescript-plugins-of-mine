import { unionEquals } from 'typescript-ast-util';
import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { buildTextChange } from './toNamedParams';

/**
# Description

This will remove comments selection that don't match with configurable patterns , by default those line comments that doesn't start with "TODO" or "heads up"

*/

export class RemoveComments implements CodeFix {
  name: string

  constructor() {
    this.name = 'removeComments'
    this.config = {
      commentType: 'line',//'line'|'block'|'both'
      pattern: (s: string) => !s.toLowerCase().trim().startsWith('todo') || !s.toLowerCase().trim().startsWith('heads up')
    }
  }

  config: any

  predicate(options: CodeFixOptions): boolean {
    if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
      options.log('predicate false because not a range : ' + JSON.stringify(options.positionOrRange))
      return false
    }
    const range = options.positionOrRange as ts.TextRange;
    const lineAndChar1 = options.sourceFile.getLineAndCharacterOfPosition(range.pos)
    const lineAndChar2 = options.sourceFile.getLineAndCharacterOfPosition(range.end)
    if (lineAndChar2.line - lineAndChar1.line > 1) {
      return true
    }
    else {
      options.log('predicate false because not enough distance between ' + JSON.stringify(lineAndChar1) + ' and ' + JSON.stringify(lineAndChar2))
      return false
    }
  }

  description(options: CodeFixOptions): string { return `Remove comments` }

  apply(options: CodeFixOptions) {
    if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
      return
    }
    const range = options.positionOrRange as ts.TextRange;
    const sourceFile = options.simpleNode.getSourceFile()
    let textChanges: ts.TextChange[] = []
    sourceFile.getDescendants()
      .forEach(d => {
        d.getLeadingCommentRanges().concat(d.getTrailingCommentRanges())
          .forEach(c => {
            const match = c.getKind() === ts.SyntaxKind.SingleLineCommentTrivia && c.getPos() >= range.pos && c.getEnd() <= range.end && this.config.pattern(c.getText())
            if (match) {
              textChanges.push(buildTextChange('', c.getPos(), c.getWidth()))
            }
          })
      })
    textChanges = unionEquals(textChanges, [], (a, b) => JSON.stringify(a) === JSON.stringify(b))
    const refactor: ts.RefactorEditInfo = {
      edits: [
        {
          fileName: sourceFile.getFilePath(),
          textChanges,
        }
      ]
    }
    return refactor
  }

}

export const removeComments = new RemoveComments() 