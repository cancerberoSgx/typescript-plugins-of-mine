/*
fix this error: 	"code": "2339", "message": "Property 'bar' does not exist on type '{ foo: () => number; }'.",
In expressions lie the following: 


const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true)      // <---- will add bar as method of literal object o
interface Hello {
}
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

*/

//TODO: check if diagnostic is in the same position  in predicate 

import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixNodeOptions } from '../codeFixes';
import { VariableDeclarationKind, FunctionDeclaration, TypeGuards, InterfaceDeclarationStructure, MethodSignatureStructure } from 'ts-simple-ast';
import { now, timeFrom, fromNow } from 'hrtime-now';


export const declareMember: CodeFix = {
  name: 'declareMember',
  config: {},
  predicate: (arg: CodeFixNodeOptions): boolean => {
    //TODO: review this predicate
    if (!arg.diagnostics.find(d => d.code === 2339)) {
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
    else {
      arg.log('declareReturnType predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },
  description: (arg: CodeFixNodeOptions): string => `Declare Missing Member "${arg.containingTarget.getText()}"`,
  apply: (opts: CodeFixNodeOptions): ts.ApplicableRefactorInfo[] | void => {
    const node = opts.simpleNode

    const print = (msg) => { opts.log('declareMember apply ' + msg) }
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
      args_ = callExpression.getArguments().map(a => ({ name: `arg${argCounter++}`, type: typeChecker.getTypeAtLocation(a).getBaseTypeOfLiteralType() }))
    }
    fixTargetDecl(accessExpr, newMemberName_, newMemberType_, args_, print)
  }
}


// now we need to get the target declaration and add the member. It could be an object literal decl{}, an interface decl or a class decl
const fixTargetDecl = (targetNode, newMemberName, newMemberType, args, print) => {
  let decls
  if (targetNode.getExpression) {
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
      if (typeDeclInThisFile && (TypeGuards.isInterfaceDeclaration(typeDeclInThisFile) || TypeGuards.isClassDeclaration(typeDeclInThisFile)) && !(typeDeclInThisFile.getMembers() as { getName: () => string }[]).find(m => m.getName() === newMemberName)) {
        return fixTargetDecl(typeDeclInThisFile, newMemberName, newMemberType, args, print)
      }
      else if (!TypeGuards.isObjectLiteralExpression(targetInit)) {
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
          name: newMemberName,
          returnType: newMemberType.getText(),
          parameters: args.map(a => ({
            name: a.name,
            type: a.type.getText()
          }))
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


