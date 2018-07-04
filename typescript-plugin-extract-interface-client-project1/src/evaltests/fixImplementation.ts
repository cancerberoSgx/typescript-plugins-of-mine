
// interface SomeInterface extends SuperInterface1, SuperInterface2 {
//   constructor(foo: number[])
//   prop1: { s: string, n: Date }[]
// }
// interface SomeInterface2 {
//   method3(p: string): Date
// }
// const obj: SomeInterface2 = {
//   method3(p: string, b: boolean): Date {
//     throw new Error("Method not implemented.");
//   }
// }
// interface SomeInterface3 {
//   method5(p: string): Date
// }
// interface SuperInterface2 { }
// interface SuperInterface1 extends SomeInterface3 { }
// abstract class OtherImplementation implements SuperInterface1 { }
// class SomeImplementation extends OtherImplementation implements SomeInterface, SomeInterface2 {
//   method3(p: string): Date {
//     throw new Error("Method not implemented.");
//   }
//   method1(param: number): number[] {
//     throw new Error("Method not implemented.");
//   }
//   method5(p: string): Date { return null }
// }
// class Class2 implements SomeInterface {
//   prop1: boolean[]
//   constructor(foo: Date)
// }
// // "code": "2416","message": "Property 'method1' in type 'SomeImplementation' is not assignable to the same property in base type 'SomeInterface'.\n  Type '(param: number) => number[]' is not assignable to type '(param: string) => number[]'.\n    Types of parameters 'param' and 'param' are incompatible.\n      Type 'string' is not assignable to type 'number'.",


// import * as ts from 'typescript'
// import { ClassDeclaration, InterfaceDeclaration, TypeGuards, ExpressionWithTypeArguments, ParameterDeclaration, ParameterDeclarationStructure, Type, MethodSignature, FunctionLikeDeclaration } from 'ts-simple-ast'
// import { EvalContext } from 'typescript-plugin-ast-inspector';
// import { ok } from 'assert';
// declare const c: EvalContext;


// let print
// /**
//  * returns all implements clauses of this class and its super classes both things recursively 
//  */
// const getImplementsAll = (cl: ClassDeclaration): ExpressionWithTypeArguments[] => {
//   let result: ExpressionWithTypeArguments[] = []
//   cl.getImplements().forEach(impl => {
//     // TODO: types like A|B
//     result.push(impl)
//     impl.getType().getSymbolOrThrow().getDeclarations().forEach(d => {
//       if (TypeGuards.isInterfaceDeclaration(d)) {
//         result = result.concat(getExtendsRecursively(d))
//       }
//     })
//   });
//   getExtendsRecursively(cl).forEach(ext => {
//     ext.getType().getSymbolOrThrow().getDeclarations().forEach(d => {
//       if (TypeGuards.isClassDeclaration(d)) {
//         result = result.concat(getImplementsAll(d))
//       }
//     })
//   })
//   return result
// }

// const getExtendsRecursively = (decl: ClassDeclaration | InterfaceDeclaration): ExpressionWithTypeArguments[] => {
//   let extendExpressions = TypeGuards.isClassDeclaration(decl) ? (decl.getExtends() ? [decl.getExtends()] : []) : decl.getExtends()
//   extendExpressions.forEach(expr => {
//     expr.getType().getSymbol().getDeclarations().forEach(d => {
//       if (TypeGuards.isInterfaceDeclaration(d) || TypeGuards.isClassDeclaration(d)) {
//         extendExpressions = extendExpressions.concat(getExtendsRecursively(d))
//       }
//     })
//   })
//   return extendExpressions
// }


// const findInterfacesWithPropertyNamed = (decl: ClassDeclaration, memberName: string): InterfaceDeclaration[] =>
//   getImplementsAll(decl)
//     .map(expr => expr.getType().getSymbolOrThrow().getDeclarations())
//     .reduce((a, v) => a.concat(v), [])
//     .filter(TypeGuards.isInterfaceDeclaration)
//     .filter(d => d.getMembers().find(m => TypeGuards.isPropertyNamedNode(m) && m.getName() === memberName))
//     .filter((value, pos, arr) => arr.indexOf(value) === pos) // union


// const fixParameters = (member: FunctionLikeDeclaration, memberSignature: MethodSignature): void => {
//   member.setReturnType(memberSignature.getReturnType().getText())
//   // add missing params and fix exiting param types
//   let memberParams = member.getParameters()
//   let signatureParams = memberSignature.getParameters()
//   for (let i = 0; i < signatureParams.length; i++) {
//     const signatureParam = signatureParams[i]
//     if (memberParams.length <= i) {
//       member.addParameter(buildParameterStructure(signatureParam))
//     } else {
//       const memberParam = memberParams[i]
//       if (!areTypesEqual(memberParam.getType(), signatureParam.getType())) {
//         memberParam.fill({ ...buildParameterStructure(signatureParam), name: memberParam.getName() })
//       }
//       //TODO: support other modifiers/flags, etc
//     }
//   }
//   // remove extra non optional params member signature might have
//   memberParams = member.getParameters()
//   signatureParams = memberSignature.getParameters()
//   if (memberParams.length > signatureParams.length) {
//     for (let i = signatureParams.length; i < memberParams.length; i++) {
//       if (!memberParams[i].isOptional || !memberParams[i].hasInitializer) {
//         memberParams[i].remove()
//       }
//     }
//   }
// }
// const buildParameterStructure = (p: ParameterDeclaration): ParameterDeclarationStructure => ({
//   name: p.getNameOrThrow(),
//   hasQuestionToken: p.hasQuestionToken(),
//   type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
//   isRestParameter: p.isRestParameter(),
//   scope: p.hasScopeKeyword() ? p.getScope() : undefined
// })

// /** dirty way of checking if two types are compatible */
// const areTypesEqual = (t1: Type, t2: Type): boolean => t1.getText().replace(/\s+/gi, '') === t2.getText().replace(/\s+/gi, '')


// function evaluateMe() {
//   print = c.print
//   // clone source file so this one is not modified
//   const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
//   // TODO: support constructors and getter/setter
//   const id = sourceFile.getDescendantAtPos(487)//(755)//(655)//(764)
//   const member = id.getParent()
//   const decl = member.getParent()
//   if (!(TypeGuards.isIdentifier(id) &&
//     (TypeGuards.isMethodDeclaration(member) || TypeGuards.isPropertyDeclaration(member)) &&
//     TypeGuards.isClassDeclaration(decl)
//   )) {
//     return print(`predicate not complied: decl: ${decl.getKindName()} member: ${member.getKindName()} id: ${id.getKindName()}`)
//   }
//   const interfaceWithMemberName = findInterfacesWithPropertyNamed(decl, id.getText()).pop() // TODO: we choose any member signature - we should choose the most similar one

//   const memberSignature = interfaceWithMemberName.getMembers().filter(TypeGuards.isPropertyNamedNode).pop() // TODO: any arbitrary signature

//   if (TypeGuards.isMethodSignature(memberSignature) && TypeGuards.isMethodDeclaration(member)) {

//     fixParameters(member, memberSignature)

//   } else if (TypeGuards.isPropertySignature(memberSignature) && TypeGuards.isPropertyDeclaration(member)) {
//     member.setType(memberSignature.getType().getText())
//   }
//   print(sourceFile.getText().substring(0, Math.min(sourceFile.getText().length, 800)))

//   sourceFile.deleteImmediatelySync()
// }
