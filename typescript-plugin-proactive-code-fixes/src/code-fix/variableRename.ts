import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/**
 
# Description

This is the opposite as fixImplementation* - when the implementation implements an interface or class incorrectly it ill fix the interface/class instead of the implementation by adding/removing

WARNING: this is probably very dangerous operation but could be useful on initial quick type modeling from data

# Example: 
```
let a = 1
//....
let a = 's'
// ....
function a(){}
class a{}
```
# Attacks: 

"code": "2451", "message": "Cannot redeclare block-scoped variable 'a'.",

# TODO

 * check if new variable doesn't already exists

*/
export const renameVariable: CodeFix = {

  name: 'Rename variable',

  config: {},

  predicate: (options: CodeFixOptions): boolean => {
    if (options.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      options.diagnostics.find(d => d.code === 2451 && d.start === options.containingTargetLight.getStart())) {
      return true
    }
    else {
      options.log('predicate false because Identifier != ' + getKindName(options.containingTarget.kind))
      return false
    }
  },

  description: (options: CodeFixOptions): string => `Rename variable "${options.containingTarget.getText()}"`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const id = options.simpleNode
    if (!TypeGuards.isIdentifier(id)) {
      options.log('apply false because  false because Identifier != ' + getKindName(options.containingTarget.kind))
      return
    }
    // TODO: check if new variable doesn't already exists
    id.rename(id.getText() + counter++)
  }

}

let counter = 2