
// const o = {
//   foo: () => { return 1 }
// }
// const val: string[] = o.bar(1, ['w'], true)
// interface Hello {
// }
// const hello: Hello = {}
// let i: string[]
// i = hello.world([[1, 2, 3], [4, 5]])
// const k = hello.mama(1, 2, 3) + ' how are you?'
// function f(h: Hello) {
//   h.fromFunc = true
// }
// var x: Date = new Date(hello.timeWhen('born'))
// class C {
//   hello: Hello
//   m(s: number[]) { this.hello.grasp(s, [false, true]) }
// }
// const notDefined:C
// const a = notDefined.foof + 9


// import { EvalContext } from 'typescript-plugin-ast-inspector';
// declare const c: EvalContext;

// function evaluateMe() {
//   const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant
//   const position = 445
//   const project = new c.SimpleProjectConstructor();
//   const sourceFile = project.createSourceFile('created.ts', `
// const o = {
//   foo: () => { return 1 }
// }
// const val: string[] = o.bar(1, ['w'], true)
// interface Hello {
// }
// const hello: Hello = {}
// let i: string[]
// i = hello.world([[1, 2, 3], [4, 5]])
// const k = hello.mama(1, 2, 3) + ' how are you?'
// function(h: Hello) {
//   h.fromFunc = true
// }
// var x: Date = new Date(hello.timeWhen('born'))
// class C {
//   hello: Hello
//   m(s: number[]) { this.hello.grasp(s, [false, true]) }
// }
// const notDefined:C
// const a = notDefined.foof + 9
// `)
//   const node = sourceFile.getDescendantAtPos(position)
//   const typeChecker = project.getTypeChecker()
//   const newMemberName_ = node.getText()
//   const accessExpr = node.getParent()
//   if (!TypeGuards.isPropertyAccessExpression(accessExpr)) {
//     return print(`WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) ${accessExpr.getKindName()}`)
//   }
//   const expressionWithTheType = accessExpr.getParent().getKind() === ts.SyntaxKind.CallExpression ?
//     accessExpr.getParent().getParent() : accessExpr.getParent()
//   const newMemberType_ = typeChecker.getTypeAtLocation(expressionWithTheType).getBaseTypeOfLiteralType()
//   // now we extract arguments in case is a method call, example: const k = hello.mama(1,2,3)+' how are you?'-.
//   let args_
//   const callExpression = accessExpr.getParent()
//   if (TypeGuards.isCallExpression(callExpression)) {
//     let argCounter = 0
//     args_ = callExpression.getArguments().map(a => ({ name: `arg${argCounter++}`, type: typeChecker.getTypeAtLocation(a).getBaseTypeOfLiteralType() }))
//   }
//   // now we need to get the target declaration and add the member. It could be an object literal decl{}, an interface decl or a class decl
//   const fixTargetDecl = (targetNode, newMemberName, newMemberType, args) => {
//     let decls
//     if (targetNode.getExpression) {
//       decls = targetNode.getExpression().getSymbol().getDeclarations()
//     } else if (targetNode && targetNode.getKindName().endsWith('Declaration')) {
//       decls = [targetNode]
//     } else {
//       return print(`WARNING cannot recognized targetNode : ${targetNode && targetNode.getKindName()} ${targetNode && targetNode.getText()}`)
//     }
//     decls.forEach(d => {
//       if (TypeGuards.isVariableDeclaration(d)) {
//         // TODO: if there is a clear interface or class that this variable implements and is in this file the we fix there and not here
        
//         const targetInit = d.getInitializer()
//         const typeDeclInThisFile = (d.getType() && d.getType().getSymbol() && d.getType().getSymbol().getDeclarations() && d.getType().getSymbol().getDeclarations()).find(dd => (TypeGuards.isInterfaceDeclaration(dd) || TypeGuards.isClassDeclaration(dd)) && dd.getSourceFile() === d.getSourceFile())
//         if (typeDeclInThisFile) {
//           // return print('sshshhssh'+JSON.stringify({newMemberName, newMemberType: newMemberType.getText(), args: args&&args.length}))
//           fixTargetDecl(typeDeclInThisFile, newMemberName, newMemberType, args) // recurse - the new member will be added to that decl if any
//         } 
//         else if (!TypeGuards.isObjectLiteralExpression(targetInit)) {
//           //TODO - unknown situation - we should print in the file for discover new cases.
//           print(`WARNING  !TypeGuards.isObjectLiteralExpression(targetInit) targetInit.getKindName() === ${targetInit && targetInit.getKindName()} targetInit.getText() === ${targetInit && targetInit.getText()}  d.getKindName() === ${d && d.getKindName()} d.getText() === ${d && d.getText()}`)
//         }
//         else if (!args) {
//           targetInit.addPropertyAssignment({ name: newMemberName, initializer: 'null' })
//         }
//         else {
//           targetInit.addMethod({
//             name: newMemberName,
//             returnType: newMemberType.getText(),
//             bodyText: `throw new Error('Not Implemented')`,
//             parameters: args.map(a => ({ name: a.name, type: a.type.getText() }))
//           })
//         }
//       } else if (TypeGuards.isInterfaceDeclaration(d)) {
//         if (!args) {
//           d.addProperty({ name: newMemberName, type: newMemberType.getText() })
//         } else {
//           d.addMethod(
//             {
//               name: newMemberName,
//               returnType: newMemberType.getText(),
//               parameters: args.map(a => ({
//                 name: a.name,
//                 type: a.type.getText()
//               }))
//             })
//         }
//       } else if (TypeGuards.isClassDeclaration(d)) {
//         if (!args) {
//           d.addProperty({ name: newMemberName, type: newMemberType.getText() })
//         } else {
//           d.addMethod(
//             {
//               name: newMemberName,
//               returnType: newMemberType.getText(),
//               parameters: args.map(a => ({
//                 name: a.name,
//                 type: a.type.getText()
//               }))
//             })
//         }
//       }
//       else if (TypeGuards.isParameterDeclaration(d) || TypeGuards.isPropertyDeclaration(d)) {
//         // we are referencing a parameter or a property - not a variable - so we need to go to the declaration's declaration
//         d.getType().getSymbol().getDeclarations().map(dd => {
//           fixTargetDecl(dd, newMemberName, newMemberType, args) // recursive!
//         })
//       }
//       else {
//         print(`WARNING: is another thing isParameterDeclaration ${d.getKindName()}`)
//       }
//     })
//   }

//   fixTargetDecl(accessExpr, newMemberName_, newMemberType_, args_)
//   print(sourceFile.getText())

// }