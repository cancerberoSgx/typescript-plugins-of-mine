
import { VariableDeclarationKind, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

/*

# description

reassigning a const variable is an error  this fix suggest changing it to let. Also it will suggest to remove the "readonly" keyword if trying to assign a readonly property

# example

```
const a = 1
a = 2


class Something12{
  readonly prop: number = 1
}
const s55 = new Something12()
s55.prop = 1; // suggestion: remove "readonly" keyword from property "prop"
```

# Attack
"code": "2540",	"message": "Cannot assign to 'a' because it is a constant or a read-only property.",

# TODO

 * unit tests
 * config
  */
export const const2let: CodeFix = {

  name: 'const2let',

  config: {
    // possible values: 'let' or 'var'
    changeTo: 'let'
  },

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      arg.diagnostics.find(d => d.code === 2540 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => {
    if(ts.isPropertyAccessExpression(arg.containingTarget.parent)) {
      return `Remove readonly keyword from "${arg.containingTarget.getText()}" property`
    }
    return `Change "const ${arg.containingTarget.getText()}" to "let ${arg.containingTarget.getText()}"`
  },

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const id = arg.simpleNode
    if (!id || id.getKind() !== ts.SyntaxKind.Identifier) {
      arg.log(`apply cannot exec because of this !id||id.getKind()!== ts.SyntaxKind.Identifier  `)
      return
    }
    else {
      
    id.getSymbol().getDeclarations().map(d => {
      if (TypeGuards.isVariableDeclaration(d)) {
        d.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement).setDeclarationKind(VariableDeclarationKind.Let)
        arg.log(`isVariableDeclaration isVariableDeclaration changed to let`)
      }
      else if (TypeGuards.isPropertyDeclaration(d)) {
        d.setIsReadonly(false)
        arg.log(`removed readonly from ${d.getText()}`)
      }
      else {
        arg.log(`nothing done for decl ${d.getText()} because ${d.getKindName()} not isVariableDeclaration nor isPropertyDeclaration `)
      }
    })
    }
    // else if (id.getParent() && id.getParent()!.getParent() && id.getParent()!.getParent()!.getKind() === ts.SyntaxKind.ExpressionStatement) {
    //   const declStatement = id.getSourceFile().getVariableStatement(v => v.getDeclarationKind() === VariableDeclarationKind.Const && !!v.getDeclarations().find(vv => vv.getName() === id.getText()))
    //   declStatement.setDeclarationKind(VariableDeclarationKind.Let)
    // }
    // else {
    //   arg.log(`apply cannot exec because this was false: id.getParent() && id.getParent()!.getParent() && id.getParent()!.getParent()!.getKind()===ts.SyntaxKind.ExpressionStatement `)
    // }
  }

}
