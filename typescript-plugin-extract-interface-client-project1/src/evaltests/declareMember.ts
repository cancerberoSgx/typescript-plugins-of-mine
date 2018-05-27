
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama()+' how are you?'

import { EvalContext } from 'typescript-plugin-ast-inspector';
import { access } from 'fs';
declare const c: EvalContext;

function evaluateMe() {
  const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant
  const position = 291
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'

`)
  const node = sourceFile.getDescendantAtPos(position)
  print('node.getAncestors()==='+node.getAncestors().map(a=>a.getKindName()+`(${a.getText()})`).join(', '))
  const typeChecker = project.getTypeChecker()
  const  newMemberName = node.getText()
  
  const accessExpr = node.getParent()//getFirstAncestorByKind(ts.SyntaxKind.PropertyAccessExpression)
  if(!TypeGuards.isPropertyAccessExpression(accessExpr)){
    return print(`WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) ${accessExpr.getKindName()}`)// TODO: log
  }
  const expressionWithTheType = accessExpr.getParent().getKind()===ts.SyntaxKind.CallExpression ?  accessExpr.getParent().getParent() :  accessExpr.getParent()
  const newMemberType = typeChecker.getTypeAtLocation(expressionWithTheType)

  // now we extract arguemtns in case is a method call, example: const k = hello.mama(1,2,3)+' how are you?'
  let args = []
  const callExpression = accessExpr.getParent()
  if(TypeGuards.isCallExpression(callExpression)){

  }

  // type and name ready
  
  // 
  // const binExpr = node.getFirstAncestorByKind(ts.SyntaxKind.BinaryExpression) // could be null in case is not an assignament just method call
  // if(binExpr){
  // }
  return print(`newMemberType:${newMemberType.getText()}, newMemberName: ${newMemberName} `)
  const variableDecl = node.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration)

  // let newMemberType = variableDecl.getType()
  // const newMemberName = node.getText()
  // let args /*name: string, type:Type*/

  // const init = variableDecl.getInitializer()
  // if (TypeGuards.isCallExpression(init)) {
  //   let argCounter = 0
  //   args = init.getArguments().map(a => ({ name: `arg${argCounter++}`, type: typeChecker.getTypeAtLocation(a).getBaseTypeOfLiteralType() }))
  // }
  // else {
  //   // could be const v :string = o.property2   we already have the data for this : newMemberType, newMemberName
  // }
  // // now we need to get the target declaration and add the member. It could be an object literal decl{}, an interface decl or a class decl
  // accessExpr.getExpression().getSymbol().getDeclarations().forEach(d => {
  //   if (TypeGuards.isVariableDeclaration(d)) {
  //     const targetInit = d.getInitializer()
  //     if (!TypeGuards.isObjectLiteralExpression(targetInit)) {
  //       print(`WARNING  !TypeGuards.isObjectLiteralExpression(targetInit) ${targetInit.getKindName()} ${targetInit.getText()}`)
  //       return //TODO LOG - what it is ?? we need to support it?
  //     }
  //     if(!args){
  //       targetInit.addPropertyAssignment({name: newMemberName, initializer: 'null'})
  //     }
  //     else {
  //       targetInit.addMethod({
  //         name: newMemberName, 
  //         returnType: newMemberType.getText(), 
  //         bodyText: `throw new Error('Not Implemented')`, 
  //         parameters: args.map(a=>({name: a.name, type: a.type.getText()}) )
  //       })
  //     }
  //   }else {
  //     print(`is another thing ${targetInit.getKindName()}`)
  //   }
  // })

  // print(sourceFile.getText())

}
var __output = `
Output:
node.getAncestors()===PropertyAccessExpression(hello.mama), CallExpression(hello.mama(1,2,3)), BinaryExpression(hello.mama(1,2,3)+' how are you?'), VariableDeclaration(k = hello.mama(1,2,3)+' how are you?'), VariableDeclarationList(const k = hello.mama(1,2,3)+' how are you?'), VariableStatement(const k = hello.mama(1,2,3)+' how are you?'), SourceFile(const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'

)
newMemberType:string, newMemberName: mama 

`
var __output = `
Output:
node.getAncestors()===PropertyAccessExpression(hello.mama), CallExpression(hello.mama(1,2,3)), BinaryExpression(hello.mama(1,2,3)+' how are you?'), VariableDeclaration(k = hello.mama(1,2,3)+' how are you?'), VariableDeclarationList(const k = hello.mama(1,2,3)+' how are you?'), VariableStatement(const k = hello.mama(1,2,3)+' how are you?'), SourceFile(const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'

)
newMemberType:any, newMemberName: mama 

`
var __output = `
Output:
node.getAncestors()===PropertyAccessExpression(hello.mama), BinaryExpression(hello.mama+' how are you?'), VariableDeclaration(k = hello.mama+' how are you?'), VariableDeclarationList(const k = hello.mama+' how are you?'), VariableStatement(const k = hello.mama+' how are you?'), SourceFile(const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama+' how are you?'

)
newMemberType:string, newMemberName: mama 

`
var __output = `
Output:
node.getAncestors()===PropertyAccessExpression(hello.mama), BinaryExpression(hello.mama+' how are you?'), VariableDeclaration(k = hello.mama+' how are you?'), VariableDeclarationList(const k = hello.mama+' how are you?'), VariableStatement(const k = hello.mama+' how are you?'), SourceFile(const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama+' how are you?'

)
newMemberType:any, newMemberName: mama, any

`
var __output = `
Output:
node.getAncestors()===PropertyAccessExpression(hello.mama), CallExpression(hello.mama()), BinaryExpression(hello.mama()+' how are you?'), VariableDeclaration(k = hello.mama()+' how are you?'), VariableDeclarationList(const k = hello.mama()+' how are you?'), VariableStatement(const k = hello.mama()+' how are you?'), SourceFile(const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama()+' how are you?'

)
newMemberType:any, newMemberName: mama, any

`
var __output = `
Output:
node.getAncestors()===PropertyAccessExpression, CallExpression, BinaryExpression, VariableDeclaration, VariableDeclarationList, VariableStatement, SourceFile
newMemberType:any, newMemberName: mama, any

`
var __output = `
Output:
node.getAncestors()===CallExpression, BinaryExpression, VariableDeclaration, VariableDeclarationList, VariableStatement, SourceFile
WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) CallExpression

`
var __output = `
Output:
WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) CallExpression

`