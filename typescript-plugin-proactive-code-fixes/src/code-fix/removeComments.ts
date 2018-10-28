import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { findChildContainedRange } from 'typescript-ast-util';
import { TypeGuards } from 'ts-simple-ast';
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
    return true
    // if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
    //   options.log('predicate false because not a range : '+JSON.stringify(options.positionOrRange))
    //   return false
    // }
    // const range = options.positionOrRange as ts.TextRange;
    // const lineAndChar1 = options.sourceFile.getLineAndCharacterOfPosition(range.pos)
    // const lineAndChar2 = options.sourceFile.getLineAndCharacterOfPosition(range.end)
    // if (lineAndChar2.line - lineAndChar1.line > 1) {
    //   return true
    // }
    // else {
    //   options.log('predicate false because not enough distance between '+JSON.stringify(lineAndChar1)+ ' and '+JSON.stringify(lineAndChar2) )
    //   return false
    // }
  }

  description(options: CodeFixOptions): string { return `Remove comments` }

  apply(options: CodeFixOptions) {
    if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
      return
    }
    const range = options.positionOrRange as ts.TextRange;

    const sourceFile = options.simpleNode.getSourceFile()
    // const toRemove =     ()

    let textChanges: ts.TextChange[] = []
    sourceFile.getDescendants()
      // filter(d=>)
      .forEach(d => {
        d.getLeadingCommentRanges().concat(d.getTrailingCommentRanges())
          .forEach(c => {
            const match = c.getKind() === ts.SyntaxKind.SingleLineCommentTrivia && c.getPos() >= range.pos && c.getEnd() <= range.end && this.config.pattern(c.getText())
            if (match) {
              textChanges.push(buildTextChange('', c.getPos(), c.getWidth()))
            }
          })
        // return match.map(m=>m.getText())
      })
    function unionEquals(left, right, equals) {
      return left.concat(right).reduce((acc, element) => {
        return acc.some(elt => equals(elt, element)) ? acc : acc.concat(element)
      }
      , []);
    }

    textChanges = unionEquals(textChanges, [], (a, b) => JSON.stringify(a) === JSON.stringify(b))
    // textChanges = textChanges.filter((c, i, arr)=>arr.indexOf(c)===i||JSON.stringify(c)===JSON.stringify(arr[i]))
    // console.log('changes: ' + textChanges.map(c => JSON.stringify(c)).join(',\n'))
    const refactor: ts.RefactorEditInfo = {
      edits: [
        {
          fileName: sourceFile.getFilePath(),
          textChanges,
            // ,
          //   : [{ "newText": "", "span": { "start": 1, "length": 18 } }
          //   , { "newText": "", "span": { "start": 34, "length": 14 } }
          //   , { "newText": "", "span": { "start": 65, "length": 9 } }
          //   , { "newText": "", "span": { "start": 77, "length": 7 } }]
          // //: [
          // {
          //   newText: 'SEBA', 
          //   span: {
          //     start: 2, 
          //     length: 10
          //   }
          // }
          // ]
        }
      ]
    }
    return refactor


    // console.log('ro remove', toRemove);
    // const child = findChildContainedRange(options.positionOrRange as ts.TextRange)

    // const fullSource = options.simpleNode.getSourceFile().getFullText()
    // const text = fullSource.substring(range.pos, range.end).replace(/\s*\n\r\s*/gm, '\n\r').replace(/\s*\n\s*/gm, '\n')
    // const fullText = fullSource.substring(0, range.pos) + text + fullSource.substring(range.end, fullSource.length)    
    // options.simpleNode.getSourceFile().replaceWithText(fullText)
    // options.simpleNode.getSourceFile().formatText()
  }

}

export const removeComments = new RemoveComments() 