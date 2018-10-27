

import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant, getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { findInterfacesWithPropertyNamed, fixSignature } from '../util';


/**

# Description: 

When implementation miss ot implement a member or is doing it incorrectly, select member name and accept suggestion "implement interface"

# Diagnostic error attacked: 

"code": "2416","message": "Property 'method1' in type 'SomeImplementation' is not assignable to the same property in base type 'SomeInterface'.\n  Type '(param: number) => number[]' is not assignable to type '(param: string) => number[]'.\n    Types of parameters 'param' and 'param' are incompatible.\n      Type 'string' is not assignable to type 'number'.",

# How to reproduce: 
```
interface SomeInterface {
  prop1: { s: string, n: Date }[]
}
class Class2 implements SomeInterface {
  prop1: boolean[]        <----- here select prop1 and implement interface it will fix prop1 signature
}
```

# TODO

 * TODO: work for constructors and setter/getter members
 * TODO: review
 * 
 * TODO: this is failing: 
class Unit {
  energy: number
}
const unit: Unit = {
  energy: 123, color: 'red' 
}

 *  we choose any member signature - we should choose the most similar one
 
 * config: 
```
config: {
    // recursive tre will generate the whole sub literals.. 
    recursive: false,
    // add missing properties declared to interface so there are no errors in strict mode
    addMissingPropertiesToInterface: false
  },
```
*/

export const implementInterfaceMember: CodeFix = {

  name: 'implementInterfaceMember',

  config: {
    // recursive tre will generate the whole sub literals.. 
    recursive: false,
    // add missing properties declared to interface so there are no errors in strict mode
    addMissingPropertiesToInterface: false
  },

  predicate: (arg: CodeFixOptions): boolean => {
    if (arg.containingTargetLight.kind === ts.SyntaxKind.Identifier &&
      arg.diagnostics.find(d => d.code === 2416 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log('predicate false because child.kind dont match ' + getKindName(arg.containingTargetLight.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Implement interface`,

  apply: (arg: CodeFixOptions) => {
    const id = arg.simpleNode
    const member = id.getParent()
    const decl = member.getParent()
    if (!(TypeGuards.isIdentifier(id) &&
      (TypeGuards.isMethodDeclaration(member) || TypeGuards.isPropertyDeclaration(member)) &&
      TypeGuards.isClassDeclaration(decl)
    )) {
      return arg.log(`predicate not complied: decl: ${decl.getKindName()} member: ${member.getKindName()} id: ${id.getKindName()}`)
    }
    const interfaceWithMemberName = findInterfacesWithPropertyNamed(decl, id.getText()).pop() // TODO: we choose any member signature - we should choose the most similar one

    const memberSignature = interfaceWithMemberName.getMembers().filter(TypeGuards.isPropertyNamedNode).pop() // TODO: any arbitrary signature

    if (TypeGuards.isMethodSignature(memberSignature) && TypeGuards.isMethodDeclaration(member)) {
      fixSignature(member, memberSignature)
    } else if (TypeGuards.isPropertySignature(memberSignature) && TypeGuards.isPropertyDeclaration(member)) {
      member.setType(memberSignature.getType().getText())
    }
  }

}


