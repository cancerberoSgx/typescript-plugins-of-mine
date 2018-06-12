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
    if (!options.positionOrRange || !(options.positionOrRange as any).pos) {
      return false
    }
    const range = options.positionOrRange as ts.TextRange;
    const lineAndChar1 = options.sourceFile.getLineAndCharacterOfPosition(range.pos)
    const lineAndChar2 = options.sourceFile.getLineAndCharacterOfPosition(range.end)
    if (lineAndChar2.line - lineAndChar1.line < 3) {
      return true
    }
    return true
  },

  description: (options: CodeFixOptions): string => `Remove selection's empty lines`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    if (!options.positionOrRange || !(options.positionOrRange as any).pos) {
      return
    }
    const range = options.positionOrRange as ts.TextRange;
    const text = options.simpleNode.getSourceFile().getFullText().substring(range.pos, range.end);
    options.simpleNode.getSourceFile().replaceText([range.pos, range.end], 
      text.replace(/\s*\n\r\s*/gm, '\n\r').replace(/\s*\n\s*/gm, '\n'))
  }

}
