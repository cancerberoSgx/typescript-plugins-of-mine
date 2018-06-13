import { now, timeFrom } from 'hrtime-now';
import { ClassDeclaration, HeritageClause, InterfaceDeclaration, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';


/**
# Description

Suggests declaring an empty class or interface when a something is extending or implementing something that is not found

# Example

```
class Onion extends NonExistent implements NonExistentInterface{}
```

# Attacks
 
	"code": "2304",	"message": "Cannot find name 'NonExistentInterface'.",

# TODO
 
 * issue: move scroll to end of file
 * issue - break  target class' jsdoc
 * TODO:  modify the file using  insertClass or insertInterface using Structures no text
 * config

 */
export const declareClass: CodeFix = {

  name: 'declareClass',

  config: {
    // TODO: declare it in new file ? only if user put a special comment ? 
    inNewFile: false,
    // TODO: could be true|false|string . add jsdoc to new class/interface declaration
    jsdoc: true,
  },

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      arg.diagnostics.find(d => d.code === 2304 && d.start === arg.containingTargetLight.getStart())
    ) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => {
    return `Declare type "${arg.containingTargetLight.getText()}"`
  },

  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    let simpleClassDec: ClassDeclaration | InterfaceDeclaration = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
    if (!simpleClassDec) {
      simpleClassDec = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.InterfaceDeclaration)
    }
    if (!simpleClassDec) {
      arg.log('not applying cause cannot find any ancestor of kind ClassDeclaration|InterfaceDeclaration')
    }
    let h: HeritageClause

    if (!TypeGuards.isHeritageClause(h = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.HeritageClause))) {
      return
    }
    const what = simpleClassDec.getKind() === ts.SyntaxKind.InterfaceDeclaration ? 'interface' : h.getToken() === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'
    const code =
      `
/**
 * TODO: document this ${what}.
 */
${simpleClassDec.isExported() ? 'export ' : ''}${what} ${arg.simpleNode.getText()} {

}
`
    // TODO:  modify the file using  insertClass or insertInterface using Structures no text
    arg.simpleNode.getSourceFile().insertText(simpleClassDec.getStart(), code)
    arg.log('apply took ' + timeFrom(t0))
  }

}
