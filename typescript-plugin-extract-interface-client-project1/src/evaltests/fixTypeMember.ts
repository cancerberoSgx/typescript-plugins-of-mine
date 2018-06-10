
// // TODO: I think this is almost the same as declareMember


// import * as ts from 'typescript'
// import { ClassDeclaration, InterfaceDeclaration, TypeGuards, ExpressionWithTypeArguments, ParameterDeclaration, ParameterDeclarationStructure, Type, MethodSignature, FunctionLikeDeclaration } from 'ts-simple-ast'
// import { EvalContext } from 'typescript-plugin-ast-inspector';
// import { dumpAst } from 'typescript-ast-util'
// import { ok } from 'assert';
// declare const c: EvalContext;


// let print
// /**
 
// # Description

// This is the opposite as fixImplementation* - when the implementation implements an interface or class incorrectly it ill fix the interface/class instead of the implementation by adding/removing

// WARNING: this is probably very dangerous operation but could be useful on initial quick type modeling / prototyping 

// # Example: 
// ```
// interface Actor {
//   act(other: Actor): Array<Date>
//   talk(script:string): number|boolean
// }
// const actor1: Actor= {
//   act(what, when){return [what.getTime()]}
// }
// ```
// # Attacks: 
// "code": "2416","message": "Property 'method1' in type 'SomeImplementation' is not assignable to the same property in base type 'SomeInterface'.\n  Type '(param: number) => number[]' is not assignable to type '(param: string) => number[]'.\n    Types of parameters 'param' and 'param' are incompatible.\n      Type 'string' is not assignable to type 'number'.",
// */

// interface Actor {
//   act(other: Actor): Array<Date>
//   talk(script: string): number | boolean
// }
// const actor1: Actor = { //	"code": "2322",	"message": "Type '{ act(what: any, when: any): any[]; }' is not assignable to type 'Actor'.\n  Property 'talk' is missing in type '{ act(what: any, when: any): any[]; }'.",

//   act(other: Actor): string[] { return ['hello'] }, // "code": "2322", "message": "Type 'string[]' is not assignable to type 'Date[]'.\n  Type 'string' is not assignable to type 'Date'.",
//   talk(script: boolean[]): Date[][] {return [[]]}
// }
// function fa(a: Actor) { }
// fa({ // "code": "2345",	"message": "Argument of type '{ act(what: () => string, : any): string; }' is not assignable to parameter of type 'Actor'.\n  Property 'talk' is missing in type '{ act(what: () => string, : any): string; }'.",
//   act(what: () => string, when) { return [true] },
//   foo: 123
// })

// function evaluateMe() {
//   print = c.print
//   // clone source file so this one is not modified
//   const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
//   const id = sourceFile.getDescendantAtPos(1365)
//   // if(!TypeGuards.isIdentifier(id)||!TypeGuards.is)
//   print(dumpAst(id.getParent().compilerNode))
//   sourceFile.deleteImmediatelySync()
// }
// var __output = `
// Output:
// InterfaceDeclaration : "interface Actor { act(other: Actor): Array<Date> talk(script"
// Actor Identifier : "Actor"
// MethodSignature : "act(other: Actor): Array<Date>"
//   act Identifier : "act"
//   Parameter : "other: Actor"
//     other Identifier : "other"
//     TypeReference : "Actor"
//       Actor Identifier : "Actor"
//   TypeReference : "Array<Date>"
//     Array Identifier : "Array"
//     TypeReference : "Date"
//       Date Identifier : "Date"
// MethodSignature : "talk(script: string): number | boolean"
//   talk Identifier : "talk"
//   Parameter : "script: string"
//     script Identifier : "script"
//     StringKeyword : "string"
//   UnionType : "number | boolean"
//     NumberKeyword : "number"
//     BooleanKeyword : "boolean"

// `
