import { now, timeFrom } from 'hrtime-now';
import { HeritageClause, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName, findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';


let heritageClause: ts.HeritageClause


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

  name: 'Declare class',

  config: {
    // TODO: declare it in new file ? only if user put a special comment ? 
    inNewFile: false,
    // TODO: could be true|false|string . add jsdoc to new class/interface declaration
    jsdoc: true,
  },

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      ( heritageClause = findAscendant<ts.HeritageClause>(arg.containingTargetLight, ts.isHeritageClause)) && 
      arg.diagnostics.find(d => d.code === 2304 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => {
    return `Declare ${heritageClause && heritageClause.token === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'} "${arg.containingTargetLight.getText()}"`
  },

  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    const simpleClassDec = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
    let h: HeritageClause

    if (!TypeGuards.isHeritageClause(h = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.HeritageClause))) {
      return
    }
    const what = h.getToken() === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'
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
