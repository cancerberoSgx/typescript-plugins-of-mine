
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

 * constructors - doesn't fix them
 * 
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


 * config to modify interface or be recursive: 
```
  config: { 
  //recursive tre will generate the whole sub literals.. TODO
    recursive: false, 
 //will add members of literal that doesn't exists in interface. TODO 
    addMissingPropertiesToInterface: false 
  }, 
```
*/

import * as ts from 'typescript';
import { getKindName, findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { VariableDeclarationKind, TypeGuards, Type, SourceFile, Node } from 'ts-simple-ast';
import { prototype } from 'stream';
import { buildParameterStructure, fixSignature, getDefaultValueForType } from '../util';

export const implementInterfaceObjectLiteral: CodeFix = {

  name: 'implementInterfaceObjectLiteral',

  config: { 
    /**recursive tre will generate the whole sub literals.. TODO */
    recursive: false, 
    /** will add members of literal that doesn't exists in interface. TODO */
    addMissingPropertiesToInterface: false 
  }, 

  predicate: (arg: CodeFixOptions): boolean => {
    const targetLine = ts.getLineAndCharacterOfPosition(arg.sourceFile, arg.containingTarget.getStart()).line
    const diagnostics = arg.diagnostics.filter(d => d.code === 2322).filter(diag => {
      const diagLineStart = ts.getLineAndCharacterOfPosition(arg.sourceFile, diag.start).line
      const diagLineEnd = ts.getLineAndCharacterOfPosition(arg.sourceFile, diag.start + diag.length).line
      return diagLineStart <= targetLine && diagLineEnd >= targetLine
    })
    if (!diagnostics || !diagnostics.length) {
      arg.log('implementInterfaceObjectLiteral predicate false because no diagnostics found with code 2322 in same line as arg.containingTarget')
      return false
    }

    if (arg.containingTarget.kind === ts.SyntaxKind.Identifier) {
      // in this case user selected a fragment of the id. quick issue fix: 
      if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.SourceFile) {
        arg.containedTarget = undefined
      }
      return true
    }
    else if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.Identifier) {
      // user selected the exactly the id (double click)
      return true
    }
    else if (arg.containedTarget && (findAscendant(arg.containedTarget, n => n.kind === ts.SyntaxKind.PropertyDeclaration) || findAscendant(arg.containedTarget, n => n.kind === ts.SyntaxKind.VariableDeclaration))) {
      return true
    }
    else {
      arg.log('implementInterfaceObjectLiteral predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Implement Interface`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const node = arg.simpleNode
    const varDecl = TypeGuards.isVariableDeclaration(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration)
    const init = varDecl.getInitializerIfKind(ts.SyntaxKind.ObjectLiteralExpression)

    varDecl.getType().getSymbol().getDeclarations().forEach(decl => {
      if (!TypeGuards.isInterfaceDeclaration(decl)) {
        return // TODO: log
      }
      const toRemove: Node[] = []

      // init.getProperties().forEach(prop => {
      //   //  -TODO: this doesn't work here : TypeGuards.isNameableNode(prop) so we ugly cast 
      //   if ((prop as any).getName && !decl.getMembers().find(m => (m as any).getName() === (prop as any).getName())) {            
      //     // if(this.config.addMissingPropertiesToInterface){ // TODO: doesn't work 
      //     // decl.addProperty({name: prop.getName(), type: prop.getType().getText()})
      //     // } else {
      //     toRemove.push(prop)
      //   }
      // })
      
      decl.getProperties().forEach(prop => {
        const existingProp = init.getProperty(prop.getName())
        if (existingProp && (existingProp as any).remove) {
          (existingProp as any).remove()
        }
        else if (existingProp && !(existingProp as any).remove){ // TODO : fixed with https://github.com/dsherret/ts-simple-ast/pull/343#issuecomment-394923115 - remove will be always present
          arg.log(`implementInterfaceObjectLiteral apply WARNING existingProp &&  !(existingProp as any).remove: kind: ${existingProp.getKindName()} text: ${existingProp.getText()} init.getText() === ${init.getText()}` )
        }
        else {
          init.addPropertyAssignment({ name: prop.getName(), initializer: getDefaultValueForType(prop.getType()) })
        }
      })

      decl.getMethods().forEach(method => {
        const existingProp = init.getProperty(method.getName())
        // if (!TypeGuards.isMethodDeclaration(existingProp)) {
        //   return
        // }
        // if (existingProp) {
        //   (existingProp as any).remove()
        // }
        // let parameters = method.getParameters().map(buildParameterStructure)
        if(existingProp && TypeGuards.isMethodDeclaration(existingProp)){
          fixSignature(existingProp, method )
          arg.log('fixSignature1')
        }
        else  if(existingProp){
            // try{
              (existingProp as any).remove()
          //   }catch(ex){
          //     arg.log('fixSignature222')}
          // }
          init.addMethod({
            name: method.getName(),
            parameters: method.getParameters().map(buildParameterStructure ),
            returnType: method.getReturnType().getText(),
            bodyText: 'throw new Error(\'Not Implemented\')'
          })
        }
        
      })

      // only remove if user explicitly configure
      // if(this.config.removeStrangeMembersFromLiteral){ // TODO: doesn't work 
      // toRemove.forEach(prop => {
      //   prop.getSourceFile().removeText(prop.getFullStart(),
      //     prop.getNextSibling() && prop.getNextSibling().getKind() === ts.SyntaxKind.CommaToken ? prop.getNextSibling().getEnd() : prop.getEnd())
      // })
      // }
    })
  }
}
