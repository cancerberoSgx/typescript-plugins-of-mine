// import * as ts from "typescript/lib/tsserverlibrary";
// import { visitChildrenRecursiveDeepFirst, filterChildren, positionOrRangeToNumber } from "typescript-ast-util";


// export function getAllReferencesToSymbolInPosition(node: ts.ClassDeclaration, info: ts.server.PluginCreateInfo, indirect = false, positionOrRange: number | ts.TextRange) {
//   let s = ''
//   const references = info.languageService
//     .findReferences(node.getSourceFile().fileName, positionOrRangeToNumber(positionOrRange))
//   if (!references) {
//     s = 'Selection has no references'
//   }
//   else {
//     s = references.map(refs => refs.references.length + refs.references.map(r => r.fileName + r.textSpan.start).join(', ')).join('--')
//   }
//   return s
// }

// export function findDefinitionsToSymbolAtPosition(sourceFile: ts.SourceFile, info: ts.server.PluginCreateInfo, positionOrRange: number | ts.TextRange) {
//   let s = ''
//   const defInfoAndBoundSpan = info.languageService.getDefinitionAndBoundSpan(sourceFile.fileName, positionOrRangeToNumber(positionOrRange))
//   // defInfoAndBoundSpan.
//   if (!defInfoAndBoundSpan || defInfoAndBoundSpan.definitions.length===0) {
//     s = 'Selection has no definitions'
//   }
//   else {
//     s = defInfoAndBoundSpan.definitions.map(r => r.fileName + r.textSpan.start).join(', ') + ' doundspan: '+defInfoAndBoundSpan.textSpan.length+' - '+defInfoAndBoundSpan.textSpan.start
//   }

//   return s

// }

// // // // info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange)).map(s=>s.references)
// // export function getAllSubclasses(info: ts.server.PluginCreateInfo): string {


// //   const sourceFiles = info.project.getFileNames()
// //     .map(path => info.project.projectService.toPath(path.toString()))
// //     .map(path => info.project.getSourceFile(path))

// //   // ts.all

// //   // // let allClasses: ts.ClassDeclaration[] = []
// //   // // const sourceFiles = info.project.getFileNames()
// //   // //   .map(path=>info.project.projectService.toPath(path.toString()))
// //   // //   .map(path => info.project.getSourceFile(path))
// //   // // sourceFiles.forEach(sf=>{

// //   // //   allClasses = allClasses.concat(filterChildren(sf, (n=>n.kind===ts.SyntaxKind.ClassDeclaration), indirect) as ts.ClassDeclaration[])
// //   // })
// //   return 'hello: ' + info.project.getFileNames().map(path => info.project.projectService.toPath(path.toString())).join(',')
// //   // return 'all classes '+allClasses.map(c=>ts.getNameOfDeclaration(c)).length
// // }


// // export function findSubclassesOf_old(node: ts.ClassDeclaration, info: ts.server.PluginCreateInfo, positionOrRange: number | ts.TextRange, indirect = false) {

// //   // let allClasses: ts.ClassDeclaration[] = []
// //   let allClasses:string[] = []
// //   const sourceFiles = info.project.getFileNames()
// //     .map(path => info.project.projectService.toPath(path.toString()))
// //     .map(path => info.project.getSourceFile(path))

// //   sourceFiles.forEach(sf => {
// //     const classesInFile = filterChildren(sf, (n => n.kind === ts.SyntaxKind.ClassDeclaration), indirect).length
// //     // allClasses = allClasses.concat(classesInFile as ts.ClassDeclaration[])
// //     allClasses.push(sf.fileName+classesInFile)
// //   })
// //   // return 'hello: ' + info.project.getFileNames().map(path => info.project.projectService.toPath(path.toString())).join(',')
// //   // return 'all classes '+allClasses.map(c=>ts.getNameOfDeclaration(c)).length
// //   return 'allclasses: '+allClasses.join(', ')
// // }
