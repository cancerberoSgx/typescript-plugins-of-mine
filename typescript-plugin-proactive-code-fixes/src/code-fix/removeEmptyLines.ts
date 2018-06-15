import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/**
# Description

This will remove empty lines of selected range
# TODO

 * dont remove empty lines that are inside a stringtemplate 

*/
export const removeEmptyLines: CodeFix = {

  name: 'removeEmptyLines',

  config: {
  },

  predicate: (options: CodeFixOptions): boolean => {
    if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
      options.log('predicate false because not a range : '+JSON.stringify(options.positionOrRange))
      return false
    }
    const range = options.positionOrRange as ts.TextRange;
    const lineAndChar1 = options.sourceFile.getLineAndCharacterOfPosition(range.pos)
    const lineAndChar2 = options.sourceFile.getLineAndCharacterOfPosition(range.end)
    if (lineAndChar2.line - lineAndChar1.line > 2) {
      return true
    }else {
      options.log('predicate false because not enough distance between '+JSON.stringify(lineAndChar1)+ ' and '+JSON.stringify(lineAndChar2) )
      return false
    }
  },

  description: (options: CodeFixOptions): string => `Remove selection's empty lines`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
      return
    }
    const range = options.positionOrRange as ts.TextRange;
    const fullSource = options.simpleNode.getSourceFile().getFullText()
    const text = fullSource.substring(range.pos, range.end).replace(/\s*\n\r\s*/gm, '\n\r').replace(/\s*\n\s*/gm, '\n')
    const fullText = fullSource.substring(0, range.pos) + text + fullSource.substring(range.end, fullSource.length)    
    options.simpleNode.getSourceFile().replaceWithText(fullText)
  }

}
