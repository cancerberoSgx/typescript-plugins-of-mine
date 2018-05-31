import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/**

# description 

assign an undeclared variable to a vaalue

example: 

a=1


# attacks :
"code": "2304", Cannot find name 'b'.",

TODO: test with jsdoc or a trailing comment
ISSUE : not suggesting in this case:  "a=new A(1)" - if in a new statement dont suggest
*/
export const codeFixCreateVariable: CodeFix = {

  name: 'Declare variable',

  config: { variableType: 'const' },

  predicate: (options: CodeFixOptions): boolean => {
    if (!options.diagnostics.find(d => d.code === 2304)) {
      return false
    }
    if (options.containingTarget.kind === ts.SyntaxKind.BinaryExpression ||
      options.containingTarget.parent && options.containingTarget.parent.kind === ts.SyntaxKind.BinaryExpression ||
      options.containingTarget.parent.parent && options.containingTarget.parent.parent.kind === ts.SyntaxKind.BinaryExpression) {
      return true
    }
    else {
      options.log('codeFixCreateVariable predicate false because child.kind dont match ' + getKindName(options.containingTarget.kind))
      return false
    }
  },

  description: (options: CodeFixOptions): string => `Declare variable "${options.containingTarget.getText()}"`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    options.simpleNode.getSourceFile().insertText(options.simpleNode.getStart(), 'const ')
  }

}