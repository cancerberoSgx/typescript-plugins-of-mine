import * as tsa from 'ts-simple-ast';
import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';


/** 

# description

declares missing member in a property access expression in some interface or class that the accessed reference implements/extends. 

# attacks
```
	"code": "2339", "message": "Property 'bar' does not exist on type '{ foo: () => number; }'.",
```

# Example: 
```
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)      // <---- will add bar as method of literal object o
interface Hello {}
const hello: Hello = {}
let i: string[]
i = hello.world([[1, 2, 3], [4, 5]])             // <----- will add world as method of interface Hello
const k = hello.mama(1, 2, 3) + ' how are you?'  // will add method mama to interface hello 
function f(h: Hello) {
  h.fromFunc = true                              // will add boolean property fromFunc to interface hello 
}
var x: Date = new Date(hello.timeWhen('born'))    // will add method timeWhen to interface Hello
class C {
  hello: Hello
  m(s: number[]) { this.hello.grasp(s, [false, true]) }  // will add method grasp to interface Hello
}
const notDefined:C
const a = notDefined.foof + 9                              // will add property foof to class C
```

# TODO: 

 * lots of unknown situations - test more

 * declare member in other than interfaces ike classes, literal objects and type declarations: for example this doest work:

```
class C {}
new C().nonExistentMethod()
```

 * (very low priority) return type for method in some scenario

```
interface Hello{}
const hello: Hello = {}
class C {
  hello: Hello
  // here - when we apply refactor on grasp I expect that generated method to return  {modified: Date, fully: boolean} and not just any
  m(s: number[]):{modified: Date, fully: boolean} { return this.hello.grasp(s, [false, true]) } 
}
```
*/

export const declareMember: CodeFix = {

  name: 'declareMember',

  config: {},

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      arg.containingTargetLight.parent.kind === ts.SyntaxKind.PropertyAccessExpression &&
      arg.diagnostics.find(d => d.code === 2339 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Declare missing member "${arg.containingTarget.getText()}"`,

  apply: (opts: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const node = opts.simpleNode
    const print = (msg) => { opts.log('apply ' + msg) }
    const typeChecker = opts.simpleProject.getTypeChecker()
    const newMemberName_ = node.getText()
    const accessExpr = node.getParent()
    if (!TypeGuards.isPropertyAccessExpression(accessExpr)) {
      return print(`WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) ${accessExpr.getKindName()}`)
    }
    const expressionWithTheType = accessExpr.getParent().getKind() === ts.SyntaxKind.CallExpression ?
      accessExpr.getParent().getParent() : accessExpr.getParent()
    const newMemberType_ = typeChecker.getTypeAtLocation(expressionWithTheType).getBaseTypeOfLiteralType()
    // now we extract arguments in case is a method call, example: const k = hello.mama(1,2,3)+' how are you?'-.
    let args_
    const callExpression = accessExpr.getParent()
    if (TypeGuards.isCallExpression(callExpression)) {
      let argCounter = 0
      args_ = callExpression.getArguments().map(a => ({
        name: `arg${argCounter++}`,
        type: typeChecker.getTypeAtLocation(a).getBaseTypeOfLiteralType()
      }))
    }
    fixTargetDecl(accessExpr, newMemberName_, newMemberType_, args_, print)
  }
}


// now we need to get the target declaration and add the member. It could be an object literal decl{}, an interface decl or a class decl
const fixTargetDecl = (targetNode: tsa.Node, newMemberName, newMemberType, args, print) => {
  let decls
  if (TypeGuards.isExpressionedNode(targetNode)||TypeGuards.isLeftHandSideExpressionedNode(targetNode)) {
    decls = targetNode.getExpression().getSymbol().getDeclarations()
  } else if (targetNode && targetNode.getKindName().endsWith('Declaration')) {
    decls = [targetNode]
  } else {
    return print(`WARNING cannot recognized targetNode : ${targetNode && targetNode.getKindName()} ${targetNode && targetNode.getText()}`)
  }
  decls.forEach(d => {
    if (TypeGuards.isVariableDeclaration(d)) {
      const targetInit = d.getInitializer()
      // Heads up - first of all - because this is a variable declaration we try to find a clear interface or class that this 
      // variable implements and is in this and doesn't already have the new member - then we fix there and not here
      const typeDeclInThisFile = (d.getType() && d.getType().getSymbol() && d.getType().getSymbol().getDeclarations() && d.getType().getSymbol().getDeclarations() || [])
        .find(dd => (TypeGuards.isInterfaceDeclaration(dd) || TypeGuards.isClassDeclaration(dd)) && dd.getSourceFile() === d.getSourceFile()
        )
      if (typeDeclInThisFile && (TypeGuards.isInterfaceDeclaration(typeDeclInThisFile) || TypeGuards.isClassDeclaration(typeDeclInThisFile))) {
        return fixTargetDecl(typeDeclInThisFile, newMemberName, newMemberType, args, print)
      }
      else
        if (!TypeGuards.isObjectLiteralExpression(targetInit)) {
          //TODO - unknown situation - we should print in the file for discover new cases.
          return print(`WARNING  !TypeGuards.isObjectLiteralExpression(targetInit) targetInit.getKindName() === ${targetInit && targetInit.getKindName()} targetInit.getText() === ${targetInit && targetInit.getText()}  d.getKindName() === ${d && d.getKindName()} d.getText() === ${d && d.getText()}`)
        }
        else if (!args) {
          targetInit.addPropertyAssignment({ name: newMemberName, initializer: 'null' })
        }
        else {
          targetInit.addMethod({
            name: newMemberName,
            returnType: newMemberType.getText(),
            bodyText: `throw new Error('Not Implemented')`,
            parameters: args.map(a => ({ name: a.name, type: a.type.getText() }))
          })
        }
    } else if (TypeGuards.isInterfaceDeclaration(d)) {
      if (!args) {
        d.addProperty({ name: newMemberName, type: newMemberType.getText() })
      } else {
        d.addMethod(
          {
            name: newMemberName,
            returnType: newMemberType.getText(),
            parameters: args.map(a => ({
              name: a.name,
              type: a.type.getText()
            }))
          })
      }
    } else if (TypeGuards.isClassDeclaration(d)) {
      if (!args) {
        d.addProperty({ name: newMemberName, type: newMemberType.getText() })
      } else {
        d.addMethod({
          // TODO: jsdoc
          name: newMemberName,
          returnType: newMemberType.getText(),
          parameters: args.map(a => ({
            name: a.name,
            type: a.type.getText()
          })),
          bodyText: `throw new Error('Not Implemented')`
        })
      }
    }
    else if (TypeGuards.isParameterDeclaration(d) || TypeGuards.isPropertyDeclaration(d)) {
      // we are referencing a parameter or a property - not a variable - so we need to go to the declaration's declaration
      d.getType().getSymbol().getDeclarations().map(dd => {
        fixTargetDecl(dd, newMemberName, newMemberType, args, print) // recursive!
      })
    }
    else {
      //TODO - unknown situation - we should print in the file for discover new cases.
      print(`WARNING: is another thing isParameterDeclaration ${d.getKindName()}`)
    }
  })
}


