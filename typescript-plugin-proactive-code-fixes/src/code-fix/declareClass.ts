import { now } from 'hrtime-now';
import { ClassDeclaration, HeritageClause, InterfaceDeclaration, TypeGuards } from 'ts-morph';
import * as ts from 'typescript';
import { findAscendant, getKindName } from 'typescript-ast-util';
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
 * modify the file using  insertClass or insertInterface using Structures no text
 * var a = nonexistentFunction(1) <--- is suggested here and should not
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
    if (
      ts.isIdentifier(arg.containingTargetLight) &&
      !ts.isTypeReferenceNode(arg.containingTargetLight.parent) &&
      !ts.isCallExpression(arg.containingTargetLight.parent) &&
      !ts.isBinaryExpression(arg.containingTargetLight.parent) &&
      (
        arg.diagnostics.find(d => d.code === 2304 && d.start === arg.containingTargetLight.getStart()) ||
        (arg.containingTargetLight.parent.kind === ts.SyntaxKind.NewExpression &&
          arg.diagnostics.find(d => d.code === 2552 && d.start === arg.containingTargetLight.getStart()))
      )
    ) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => {
    const h = findAscendant(arg.containingTargetLight, ts.isHeritageClause)
    let decl = findAscendant(arg.containingTargetLight, n => ts.isInterfaceDeclaration(n) || ts.isClassDeclaration(n))
    const what = h && decl && (ts.isInterfaceDeclaration(decl) || h.getText().includes('implements') ? 'interface' : 'class') || (arg.containingTargetLight.parent.kind === ts.SyntaxKind.NewExpression ? 'class' : undefined)
    return `Declare ${what || 'type'} "${arg.containingTargetLight.getText()}"`
  },

  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    let simpleClassDec: ClassDeclaration | InterfaceDeclaration = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
    if (!simpleClassDec) {
      simpleClassDec = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.InterfaceDeclaration)
    }
    let what: string
    let code: string
    let start: number = arg.simpleNode.getFirstAncestor(a=>TypeGuards.isBlock(a.getParent()) || TypeGuards.isSourceFile(a.getParent())).getFullStart()

    if (simpleClassDec) {
      let h: HeritageClause = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.HeritageClause)
      if (!TypeGuards.isHeritageClause(h)) {
        return
      }
      what = simpleClassDec.getKind() === ts.SyntaxKind.InterfaceDeclaration ? 'interface' : h.getToken() === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'

      code =
        `
${simpleClassDec.isExported() ? 'export ' : ''}${what} ${arg.simpleNode.getText()} {

}
`
    }
    else if (TypeGuards.isNewExpression(arg.simpleNode.getParent())) {
      what = 'class'
      code =
        `${what} ${arg.simpleNode.getText()} {

}
`
    }

    else {
      arg.log('not applying cause cannot find any ancestor of kind ClassDeclaration|InterfaceDeclaration nor its parent is a newexpression')
    }

    return {
      edits: [
        {
          fileName: arg.sourceFile.fileName,
          textChanges: [
            {
              newText: '\n'+code,
              span: {
                start,
                length: 0
              }
            }
          ]
        }
      ]
    }
  }

}
