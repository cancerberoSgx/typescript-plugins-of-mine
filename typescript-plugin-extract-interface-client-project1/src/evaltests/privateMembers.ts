

function fn76() {

  class A {
    public readonly prop3: string = 'hello'
    public constructor(private prop: number) { }
    private method(a: number): Date[] {
      return [new Date()]
    }
  }
  const a = new A(12345) // suggestion
  new A(88585858).method(1) // suggestion
  a.method(2) // suggestion

  a.prop3 = 'seb';
}


/**
 
# Description
# Attacks
```
"code": "2341",
"message": "Property 'method' is private and only accessible within class 'A'.",
```
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
 * constructors

*/
import { TypeGuards, Scope, VariableStatementStructure, FunctionTypeNode, InterfaceDeclarationStructure, ParameterDeclarationStructure } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
let print

function evaluateMe23() {
  print = c.print
  c.log = c.print
  const options = c;
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())

  const id = sourceFile.getDescendantAtPos(177);
  const parent = id.getParent()

  let name
  if (TypeGuards.isPropertyAccessExpression(parent)) {
    name = parent.getNameNode()
  } else if (TypeGuards.isNewExpression(parent)) {
    name = parent.getExpression()
    print(name.getText())
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
    if (TypeGuards.isScopedNode(d)) {
      d.setScope(Scope.Public)
      options.log(`scope changed to public`)
    }
    else {
      options.log(`scope not changed because ${d.getKindName()} not isScopedNode `)
    }
  })
  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}
