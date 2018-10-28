import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/**
# Description

This will  execute organize imports and fomat the source file in a single call

# TODO


*/

export const organizeImportsAndFormat: CodeFix = {

  name: 'organizeImportsAndFormat',

  config: {
  },

  predicate: (options: CodeFixOptions): boolean => {
    return true
  },

  description: (options: CodeFixOptions): string => `Organize Imports and Format Document`,

  apply: (options: CodeFixOptions) => {
    if (!options.positionOrRange || (options.positionOrRange as ts.TextRange).pos === undefined) {
      return
    }
    options.simpleNode.getSourceFile().organizeImports()
    options.simpleNode.getSourceFile().formatText()
  }

}
