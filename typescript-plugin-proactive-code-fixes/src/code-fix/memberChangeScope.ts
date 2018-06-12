import { Scope, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName, findChild, findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';


let targetNode: ts.Node

/**
 
# Description
# Attacks
```
"code": "2341",
"message": "Property 'method' is private and only accessible within class 'A'.",

or 

"code": "2673",
"message": "Constructor of class 'A' is private and only accessible within the class declaration.",
  

# Example

```
class A {
  private method(a: number):Date[]{
    return [new Date()]
  }
}
const a = new A()
new A().method(1) // suggestion
a.method(2) // suggestion
```
in both suggestions the resulting code will be 
```
class A {
  public method(a: number):Date[]{
    return [new Date()]
  }
}
....

# TODO

 * test get/set property accessor 
 * test with constructors 

*/
export const memberChangeScope: CodeFix = {

  name: 'memberChangeScope',

  config: {},

  predicate: (options: CodeFixOptions): boolean => {
    if (
      ((targetNode = options.containingTargetLight.kind === ts.SyntaxKind.Identifier ? options.containingTargetLight : undefined) ||
        (targetNode = findAscendant(options.containingTargetLight, ts.isNewExpression, true))) &&
      options.diagnostics.find(d =>
        (d.code === 2341 || d.code === 2673) &&
        d.start <= options.containingTargetLight.getStart() &&
        d.start + d.length >= options.containingTargetLight.getEnd()
      )
    ) {
      return true
    }
    else {
      options.log('predicate false because d.code === 2341 || d.code === 2673 || (Identifier||isNewExpression) != ' + getKindName(targetNode.kind))
      return false
    }
  },

  description: (options: CodeFixOptions): string => {
    let what = ts.isIdentifier(targetNode) ? `member ${options.containingTargetLight.getText()}` : ts.isNewExpression(targetNode) ? `constructor ${targetNode.expression.getText()}` : targetNode.getText()
    return `Make ${what} public`
  },

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const parent = options.simpleNode.getParent()
    let name
    if (TypeGuards.isPropertyAccessExpression(parent)) {
      name = parent.getNameNode()
    }
    else if (TypeGuards.isNewExpression(parent)) {
      name = parent.getExpression()
    }
    else {
      options.log(`apply false because ${parent.getKindName()} !== !TypeGuards.isPropertyAccessExpression(parent) || !TypeGuards.isNewExpression(parent)`)
      return
    }
    const declarations = name.getSymbol().getDeclarations()
    if (!declarations || declarations.length === 0) {
      options.log(`scope not changed because !declarations || declarations.length===0`)
      return
    }
    declarations.map(d => {
      if (TypeGuards.isClassDeclaration(d)) {
        d.getConstructors()[0].setScope(Scope.Public) //TODO: select the one that matches the new expr call 
        options.log(`constructor scope changed to public`)
      }
      else if (TypeGuards.isScopedNode(d)) {
        d.setScope(Scope.Public)
        options.log(`scope changed to public`)
      }
      else {
        options.log(`scope not changed because ${d.getKindName()} not isScopedNode nor isClassDeclaration `)
      }
    })
  }
}
