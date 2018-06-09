import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/**

# description 

assign an undeclared variable to a value

# example

a=1

# attacks 
"code": "2304", Cannot find name 'b'.",

TODO: test with jsdoc or a trailing comment
ISSUE : incorrectly suggesting in this case when cursor is on "Alpha" : const foo = new Alpha('hello')
*/
export const codeFixCreateVariable: CodeFix = {

  name: 'Declare variable',

  config: { variableType: 'const' },

  predicate: (options: CodeFixOptions): boolean => {
    if (
      (
        options.containingTarget.kind === ts.SyntaxKind.BinaryExpression ||
        options.containingTarget.parent && options.containingTarget.parent.kind === ts.SyntaxKind.BinaryExpression ||
        options.containingTarget.parent.parent && options.containingTarget.parent.parent.kind === ts.SyntaxKind.BinaryExpression
      )

      &&

      options.diagnostics.find(d => d.code === 2304 && d.start === options.containingTargetLight.getStart())
    ) {
      return true
    }
    else {
      options.log(`predicate false because child.kind dont match ${getKindName(options.containingTarget.kind)} - ${getKindName(options.containingTarget.parent.kind)}`)
      return false
    }
  },

  description: (options: CodeFixOptions) =>`Declare variable "${options.containingTarget.getText()}"`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    options.simpleNode.getSourceFile().insertText(options.simpleNode.getStart(), 'const ')
  }

}