// const tree1: Living = {
//   log: 877,
//   strange: []
// }
// interface Living {
//   name: string
//   log(msg?: string): Array<Array<Living>>
// }
// const tree2: Living = {
//   name: 'hehehe',
//   dddd: 'hshs' //	"code": "2322",	"message": "Type '{ name: string; dddd: string; }' is not assignable to type 'Living'.\n  Object literal may only specify known properties, and 'dddd' does not exist in type 'Living'.",
// }


// import { EvalContext } from 'typescript-plugin-ast-inspector';
// declare const c: EvalContext;

// function evaluateMe() {

//   const arg = c, print = c.print, ts = c.ts, TypeGuards = c.tsa.TypeGuards
//   const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())

//   const node = sourceFile.getDescendantAtPos(8)
//   const varDecl = TypeGuards.isVariableDeclaration(node) ? node : node.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclaration)
//   let init = varDecl.getInitializerIfKind(ts.SyntaxKind.ObjectLiteralExpression)
//   const declarations = varDecl.getType().getSymbol().getDeclarations()
//   if (!declarations || !declarations.length) {
//     arg.log(`doing nothing since !declarations || !declarations.length`)
//     return
//   }
//   declarations.forEach(decl => {
//     if (!TypeGuards.isInterfaceDeclaration(decl)) {
//       arg.log(`doing nothing for decl ${decl.getText()}`)
//       return
//     }
//     decl.getProperties().forEach(prop => {  
//       const existingProp = init.getProperty(prop.getName())
//       let oldText = ''
//       if (existingProp) {
//         oldText = existingProp.getText()
//         existingProp.remove() //TODO: we are removing good properties implementation ! 
//         existingProp.forget()
//       }
//       init.addPropertyAssignment({ name: prop.getName(), initializer: getDefaultValueForType(prop.getType())+ (!oldText ? '' : '\n/* ORIGINAL IMPLEMENTATION: \n'+oldText+'\n*/') }).forget()
//     })
//     decl.getMethods().forEach(method => {
//       const existingProp = init.getProperty(method.getName())
//       if (existingProp && TypeGuards.isMethodDeclaration(existingProp)) {
//         fixSignature(existingProp, method)
//         existingProp.forget()
//         arg.log('fixSignature1')
//         return
//       }
//       let oldText = ''
//       if (existingProp) { //TODO: we are removing good properties implementation ! 
//         oldText = existingProp.getText()
//         existingProp.remove()
//         existingProp.forget()
//       }
//       init.addMethod({
//         name: method.getName(),
//         parameters: method.getParameters().map(buildParameterStructure),
//         returnType: method.getReturnType().getText(),
//         bodyText: 'throw new Error(\'Not Implemented\');' + (!oldText ? '' : '\n/* ORIGINAL IMPLEMENTATION: \n'+oldText+'\n*/')
//       }).forget()
//     })

//     init = varDecl.getInitializerIfKind(ts.SyntaxKind.ObjectLiteralExpression)
//     init.getProperties().filter(p=>!p.wasForgotten()).forEach(prop => {
//       let name
//       if (TypeGuards.isPropertyAssignment(prop) || TypeGuards.isShorthandPropertyAssignment(prop)) {
//         name = prop.getName()
//       }
//       else if (TypeGuards.isSpreadAssignment(prop)) {
//         name = prop.getExpression().getText()
//       }
      
//       if (name && !decl.getProperty(name) && !decl.getMethod(name)) {
//         const oldText = prop.getText()
//         prop.remove();
//         const statement = init.getAncestors().find(TypeGuards.isStatement);
//         const container = statement ? statement.getFirstAncestorByKind(ts.SyntaxKind.Block)||init.getSourceFile() : init.getSourceFile()
//         const index = statement ? statement.getChildIndex() : 0
//         container.insertStatements(index , '/* Property removed: \n'+ oldText+' \n */')

//         arg.log('property removed '+name)
//       }
//       else {
//         arg.log(`ignoring object assignment property ${prop.getText()}`)
//       }
//     })
  
//     print(sourceFile.getText().substring(0, Math.min(sourceFile.getText().length, 500)))

//     sourceFile.deleteImmediatelySync()
//   })
// }






// import { ClassDeclaration, ExpressionWithTypeArguments, FunctionLikeDeclaration, InterfaceDeclaration, MethodSignature, Node, ParameterDeclaration, ParameterDeclarationStructure, SyntaxKind, Type, TypeGuards, ObjectLiteralElementLike } from "ts-simple-ast";


// export const buildParameterStructure = (p: ParameterDeclaration): ParameterDeclarationStructure => ({
//   name: p.getNameOrThrow(),
//   hasQuestionToken: p.hasQuestionToken(),
//   type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
//   isRestParameter: p.isRestParameter(),
//   scope: p.hasScopeKeyword() ? p.getScope() : undefined
// })


// /** 
//  * fix given function-like declaration parameters and type to implement given signature
//  * @param onlyTest if true it wont make any modifications (useful to test if given signautre is compatible with given decl)
//  * @returns true if given declaration is not compatible with given signature 
//  */
// export function fixSignature(decl: FunctionLikeDeclaration, signature: MethodSignature, onlyTest: boolean = false): boolean {
//   decl.setReturnType(signature.getReturnType().getText())
//   let result: boolean = false
//   // add missing params and fix exiting param types
//   let memberParams = decl.getParameters()
//   let signatureParams = signature.getParameters()
//   for (let i = 0; i < signatureParams.length; i++) {
//     const signatureParam = signatureParams[i]
//     if (memberParams.length <= i) {
//       if (!onlyTest) {
//         decl.addParameter(buildParameterStructure(signatureParam))
//       }
//       result = true
//     } else {
//       const memberParam = memberParams[i]
//       if (!areTypesEqual(memberParam.getType(), signatureParam.getType())) {
//         if (!onlyTest) {
//           memberParam.fill({ ...buildParameterStructure(signatureParam), name: memberParam.getName() })
//         }
//         result = true
//       }
//     }
//   }
//   // remove extra non optional params member signature might have
//   memberParams = decl.getParameters()
//   signatureParams = signature.getParameters()
//   if (memberParams.length > signatureParams.length) {
//     for (let i = signatureParams.length; i < memberParams.length; i++) {
//       if (!(memberParams[i].hasInitializer() || memberParams[i].isOptional())) {
//         if (!onlyTest) {
//           memberParams[i].remove()
//         }
//         result = true
//       }
//     }
//   }
//   return result;
// }

// /** dirty way of checking if two types are compatible */
// export function areTypesEqual(t1: Type, t2: Type): boolean { return t1.getText().replace(/\s+/gi, '') === t2.getText().replace(/\s+/gi, '') }


// /**
//  * returns all implements clauses of this class and its super classes both things recursively 
//  */
// export const getImplementsAll = (cl: ClassDeclaration): ExpressionWithTypeArguments[] => {
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

// export const getExtendsRecursively = (decl: ClassDeclaration | InterfaceDeclaration): ExpressionWithTypeArguments[] => {
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


// export const findInterfacesWithPropertyNamed = (decl: ClassDeclaration, memberName: string): InterfaceDeclaration[] =>
//   getImplementsAll(decl)
//     .map(expr => expr.getType().getSymbolOrThrow().getDeclarations())
//     .reduce((a, v) => a.concat(v), [])
//     .filter(TypeGuards.isInterfaceDeclaration)
//     .filter(d => d.getMembers().find(m => TypeGuards.isPropertyNamedNode(m) && m.getName() === memberName))
//     .filter((value, pos, arr) => arr.indexOf(value) === pos) // union

// /**
//  * returns a default representation of given type, for example `''` for `string`, `[]` for `Array`, etc. 
//  * TODO: this should support recursion in case it references another interface - we can recreate the whole thing recursively... 
//  */
// export function getDefaultValueForType(t: Type): string {
//   if (!t) {
//     return 'null'
//   } else if (t.getText() === 'string') {
//     return '\'\''
//   } else if (t.getText() === 'boolean') {
//     return 'false'
//   } else if (t.getText() === 'number') {
//     return '0'
//   } else if (t.getText() === 'Date') {
//     return 'new Date()'
//   } else if (t.getText() === 'RegExp') {
//     return '//ig'
//   } else if (t.isArray()) {
//     return '[]'
//   } else {
//     return 'null'
//   }
// }

// export function getName(node: Node, defaultName: string = 'unknown_name'): string {
//   const a = node as any
//   let id
//   return a && a.getName && a.getName() || (id = node.getDescendantsOfKind(SyntaxKind.Identifier)) && id.getText() || defaultName
// }
