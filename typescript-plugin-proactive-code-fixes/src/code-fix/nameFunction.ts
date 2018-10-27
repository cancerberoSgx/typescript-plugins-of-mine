
import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant, getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/**
# description

function declarations without names when they are not called is an error - suggest putting a name

# attacks

"code": "1003",	"message": "Identifier expected."

# Example: 
```
function(){}
```

# TODO

 * check if new variable doesn't already exists

 * config

*/
export const nameFunction: CodeFix = {

  name: 'nameFunction',

  config: {
    // TODO: name to put to the unnamed function
    newName: 'unnamedFunction'
  },

  predicate: (arg: CodeFixOptions): boolean => {
    const fn = findAscendant(arg.containingTargetLight, ts.isFunctionDeclaration, true)
    if (!fn || !arg.diagnostics.find(d => d.code === 1003 && d.start >= fn.getStart(arg.sourceFile) && d.start + d.length <= fn.getEnd())) {
      arg.log('predicate false because cannotfindAscendant(arg.containingTargetLight, ts.isFunctionDeclaration) or no diagnostic error 1003 code found in range')
      return false
    }
    return true
  },

  description: (arg: CodeFixOptions): string => `Name function`,

  apply: (arg: CodeFixOptions) => {
    const f = TypeGuards.isFunctionDeclaration(arg.simpleNode) ? arg.simpleNode : arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
    if (!f || f.getName()) {
      arg.log(`apply cannot exec because ${f.getKindName()} is not FunctionDeclaration or has name`)
      return
    }
    else {
      const start = f.getNameNode().getStart();
      // TODO: check if new name doesn't already exists
      f.getSourceFile().insertText(f.getNameNode().getStart(), ' unnamedFunction')
    }
  }

}