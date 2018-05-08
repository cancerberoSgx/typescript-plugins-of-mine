// import { compileSource, findChild, findIdentifierString } from "../src";
// import * as ts from 'typescript'
// const code1 = `
//     const a:number=1
//     function f(): {a: number: b: string[]}{return {a:1, b: []}}
//     const b = a+2
//     const c = 1+4
//     `
// function fail(s=''){
// console.log('fail', s);
// process.exit(1)
// }

// function main(){
// const { program, fileName, tsconfigPath } = compileSource(code1)
// const sourceFile = program.getSourceFile(fileName)
// if (!sourceFile) {
//   return fail()
// }

// // project.getTypeChecker().getTypeAtLocation(node)
// // project.getTypeChecker().getTypeOfSymbolAtLocation(symbol, node)

// let c = findChild(sourceFile, c => c.kind == ts.SyntaxKind.VariableDeclaration && ((c as ts.VariableDeclaration).name as ts.Identifier).escapedText == 'c')
// if (!c) {
//   return fail()
// }

// // project.getTypeChecker().getSymbolAtLocation(c).
// const type = program.getTypeChecker().getTypeAtLocation(c).getApparentProperties()
//   .map(p=>p.name)

//   // .map(prop => prop.getDeclarations().map(decl => findIdentifierString(decl.parent.parent)).join(', ')).join(' -  ')//.map(n=>findIdentifierString(n))).join(', ')
// console.log(type)
// }

// main()