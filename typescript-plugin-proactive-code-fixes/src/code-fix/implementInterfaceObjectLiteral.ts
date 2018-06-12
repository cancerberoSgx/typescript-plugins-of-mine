
/*

# description

you explicit a type for a object literal that is not declared - this fix will sugest create the interface automatically inferring from that object literals

Notice that typescript already has an "implement interface" refactor but is vere very poor in case wrong signatures exists and other cases

# example

```
const tree1: Living = {
}
interface Living {
  name: string
}
const tree2: Living = {
  name: 'n',
  dddd: 'hshs' //	"code": "2322",	"message": "Type '{ name: string; dddd: string; }' is not assignable to type 'Living'.\n  Object literal may only specify known properties, and 'dddd' does not exist in type 'Living'.",
}
```

# attacks
  "code": "2322",// 	"message": "Type '{}' is not assignable to type 'Living'.\n  Property 'name' is missing in type '{}'.",
  

  
# TODO

 * big issue : TODO: we are removing good properties implementations - we always perform remove() without actually checking if the property is breaking the interface or not - this removes good implementation / work 
 * constructors - doesn't fix them

 * methods from super interfaces (see implementinterfacemember.ts that does it ). example: 

 ```
 interface SomeInterface2 extends SomeInterface3 {
  method3(p: string): Date
}
const obj: SomeInterface2 = {
  method3(p: string, b: boolean): Date {
    throw new Error("Method not implemented.");
  }
}
interface SomeInterface3 {
  method5(p: { created: Date, predicate: () => boolean }): Date
}
```
  
* arrows  - this doesn't work: 

```
interface Beta {
  id: number
  canSwim: boolean
  method2: (a: string) => { created: Date, color: string }
}
const beta1:Beta = {
  id: 1, 
  canSwim: true
}
```


 * config
*/

import { Node, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { buildParameterStructure, fixSignature, getDefaultValueForType, getName } from '../util';

export const implementInterfaceObjectLiteral: CodeFix = {

  name: 'implementInterfaceObjectLiteral',

  config: {
    // recursive tre will generate the whole sub literals.. TODO 
    recursive: false,
    // will add members of literal that doesn't exists in interface. TODO 
    addMissingPropertiesToInterface: false,
    // will remove members from literal that dont belong to interface so dont give errors on strict mode. TODO
    removeStrangeMembersFromLiteral: false
  },

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      arg.diagnostics.find(d => d.code === 2322 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Make object implement interface`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const node = arg.simpleNode
    const varDecl = TypeGuards.isVariableDeclaration(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration)
    const init = varDecl.getInitializerIfKind(ts.SyntaxKind.ObjectLiteralExpression)
    const declarations = varDecl.getType().getSymbol().getDeclarations()
    if (!declarations || !declarations.length) {
      arg.log(`doing nothing since !declarations || !declarations.length`)
      return
    }
    declarations.forEach(decl => {
      if (!TypeGuards.isInterfaceDeclaration(decl)) {
        arg.log(`doing nothing for decl ${decl.getText()}`)
        return
      }
      decl.getProperties().forEach(prop => {
        const existingProp = init.getProperty(prop.getName())
        if (existingProp) {
          existingProp.remove() //TODO: we are removing good properties implementation ! 
        }
        init.addPropertyAssignment({ name: prop.getName(), initializer: getDefaultValueForType(prop.getType()) })
      })
      decl.getMethods().forEach(method => {
        const existingProp = init.getProperty(method.getName())
        if (existingProp && TypeGuards.isMethodDeclaration(existingProp)) {
          fixSignature(existingProp, method)
          arg.log('fixSignature1')
          return
        }
        if (existingProp) { //TODO: we are removing good properties implementation ! 
          existingProp.remove()
        }
        init.addMethod({
          name: method.getName(),
          parameters: method.getParameters().map(buildParameterStructure),
          returnType: method.getReturnType().getText(),
          bodyText: 'throw new Error(\'Not Implemented\')'
        })
      })
      init.getProperties().forEach(prop => {
        let name
        if (TypeGuards.isPropertyAssignment(prop) || TypeGuards.isShorthandPropertyAssignment(prop)) {
          name = prop.getName()
        }
        else if (TypeGuards.isSpreadAssignment(prop)) {
          name = prop.getExpression().getText()
        }
        if (name && (!decl.getProperty(name) && !decl.getMethod(name))) { //TODO: we are removing good properties implementation ! 
          prop.remove()
          arg.log('property removed '+name)
          return
        }
        else {
          arg.log(`ignoring object assignment property ${prop.getText()}`)
          return
        }
      })
    })
  }
}
