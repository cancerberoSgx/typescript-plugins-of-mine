// import Project, { ClassDeclaration, EnumDeclaration, ExportableNodeStructure, FunctionDeclaration, Identifier, ImportDeclaration, ImportDeclarationStructure, ImportSpecifier, InterfaceDeclaration, ReferenceEntry, SourceFile, StringLiteral, TypeGuards, VariableDeclaration } from "ts-simple-ast";
// import * as ts from 'typescript';

// /** meaning that it moved by this refactor */
// export type MovableDeclaration = ClassDeclaration | FunctionDeclaration | InterfaceDeclaration |
//   VariableDeclaration | EnumDeclaration


// export function moveDeclarationNamed(declarationName: string, file: SourceFile, project: Project, targetFile: SourceFile) {
//   let found: MovableDeclaration
//   file.forEachDescendant((child, control) => { // TODO: check is top-level
//     if (child.getKindName().endsWith('Declaration') && ((child as any).getName && (child as MovableDeclaration).getName()) === declarationName) {
//       found = child as MovableDeclaration;
//       control.stop()
//     }
//   })
//   if (!found) {
//     throw new Error(`declaration named ${declarationName} not found in file ${file.getFilePath()}`)
//   }
//   return moveDeclaration(found as MovableDeclaration, project, targetFile)
// }

// /**
//  * Moves a top level declaration to another file. See all todo comments along the code to  get idea of current
//  * state / issue. The resulting project state should not have errors. We do two important things: 
//  * 
//  * 1) fix all imports pointing to target declaration in all files of the project so they point now to the new
//  *    location (target file)
//  * 2) all nodes referenced inside the target declaration must be now imported in the target file (so the
//  *    declaration can still see them) 
//  * 
//  * **Very WIP dont use it in production yet!**
//  *
//  * @param c the declaration node to move
//  * @param project project in which to do the refactor
//  * @param targetFile the target file, inside the project where to move the class
//  */
// export function moveDeclaration(c: MovableDeclaration, project: Project, targetFile: SourceFile) {
//   const originalFile = c.getSourceFile()

//   // write declaration at the begging of target file making sure it's exported
//   let declarationText = c.getText()
//   declarationText.trim().startsWith('export') ? declarationText : 'export ' + declarationText
//   declarationText = declarationText + '\n'
//   targetFile.insertStatements(0, declarationText)

//   // add necessary imports in target file so declaration has its dependencies: 
//   fixTargetFileImports(originalFile, project, targetFile, c)

//   let modifiedFiles: { [key: string]: SourceFile } = {}
//   if ((c as ExportableNodeStructure).isExported) {
//     // if c is not exported then we dont need to perform fixProjectImports
//     modifiedFiles = fixProjectImports(c, project, targetFile, originalFile);
//   }
//   // TODO: support / test exports with custom names like :  "export $DECLARATION as OtherName ""
//   c.remove()
//   c = null // make sure we don't use this reference again

//   // now we call organizeImports on all required files, target, original and all the ones where we added imports
//   // organize imports in all files which imports decls where modified (clean unused/duplicated)
//   targetFile.organizeImports()
//   originalFile.organizeImports()
//   Object.values(modifiedFiles).forEach(file => {
//     file.organizeImports()
//   })
//   project.saveSync()
// }


// /** 
//  * For each reference inside target declaration we will need to import it in targetFile. 
//  * 
//  * TODO: we only consider imported declaration dependencies. but not dependencies in original file. 
//  * Two alternatives:
//  * we can move them too or we can export them and import them in the target file. (configurable?)
//   */
// function fixTargetFileImports(originalFile: SourceFile, project: Project,
//   targetFile: SourceFile, c: MovableDeclaration) {
//   // we copy import declarations from sourceFile to targetFile (fixing modulespecifier)
//   originalFile.forEachDescendant(d => {
//     if (d.getKind() === ts.SyntaxKind.ImportDeclaration) {
//       const importDecl = d as ImportDeclaration
//       let moduleSpecifierSourceFile
//       const moduleSpecifier = targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' +
//         ((moduleSpecifierSourceFile = importDecl.getModuleSpecifierSourceFile()) &&
//           moduleSpecifierSourceFile.getBaseNameWithoutExtension())
//       targetFile.addImportDeclaration(Object.assign(importDeclaration2Structure(importDecl), { moduleSpecifier }))
//     }
//   })
//   // And the same for all types referenced inside declaration
//   c.forEachDescendant(d => {
//     if (TypeGuards.isIdentifier(d) && d.getText() !== c.getName()) {
//       let definitionNodes
//       if ((definitionNodes = d.getDefinitionNodes()).find(d =>
//         d.getSourceFile().getFilePath() === c.getSourceFile().getFilePath() &&
//         !!(d as any /*ExportableNode*/).hasExportKeyword)) // this way we differentiate between (for ex) ClassDeclaration and PropertyDeclaration. We want only exportable things
//       {
//         targetFile.addImportDeclaration({
//           namedImports: [d.getText()],
//           moduleSpecifier: targetFile.getRelativePathAsModuleSpecifierTo(d.getSourceFile())
//         })
//       }
//     }
//   })
// }

// /**
//  * Search where target declaration is being imported, in the entire project, and update the imports
//  * so it points to the new location (targetFile)
//  * 
//  * TODO:  ts.SyntaxKind.ImportEqualsDeclaration - contemplate that kind of node - i think it's `import a = require('b')`
//  * TODO: contemplate import {x as y} from Y 
//  * TODO: contempoate import * as pp from Y
//  * TODO: contemplate internal classes (not classes declared inside functions for ex)
//  */
// function fixProjectImports(c: MovableDeclaration, project: Project, targetFile: SourceFile,
//   originalFile: SourceFile): { [key: string]: SourceFile } {
//   let parent

//   const importsReferencing = getAllReferencesToNodeSymbol(c).map(r => r.getNode())
//     .filter(n => (parent = n.getParent()) && parent.getKind() === ts.SyntaxKind.ImportSpecifier)
//     .map(n => n.getAncestors().find(p => p.getKind() == ts.SyntaxKind.ImportDeclaration)) as ImportDeclaration[]
//   let oneImportTargetDeclaration
//   const importsFiles: { [key: string]: SourceFile } = {}
//   importsReferencing.forEach(importDecl => {
//     if (targetFile.getFilePath().toString() === importDecl.getSourceFile().getFilePath().toString()) {
//       // targetFile imports c - we need to remove that import because now declaration will be here
//       targetFile.getImportDeclarations().forEach(i => {
//         const importSpecifierToC = i.getNamedImports().find(ni => ni.getText() === c.getName())
//         if (importSpecifierToC) {
//           importSpecifierToC.remove()
//         }
//         if (i.getNamedImports().length === 0) {
//           i.remove()
//         }
//       })
//     }
//     else {
//       importDecl.setModuleSpecifier(importDecl.getSourceFile().
//         getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) + '/' + targetFile.getBaseNameWithoutExtension())
//       oneImportTargetDeclaration = importDecl
//     }
//     importsFiles[importDecl.getSourceFile().getFilePath()] = importDecl.getSourceFile()
//   });

//   // Also we want to import declaration in original file (cause other parts of the file could still being
//   // referencing it.). We take advantage of these import decls here and do it here... 
//   originalFile.addImportDeclaration(Object.assign(importDeclaration2Structure(oneImportTargetDeclaration), {
//     moduleSpecifier: originalFile.getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) + '/' + targetFile.getBaseNameWithoutExtension()
//   }))

//   return importsFiles
// }


// // utilities

// /**
//  * I don't know why, but this will return more results than just c.getReferencingNodes() and is what I need
//  * now. TODO: investigate why and contribute
//  */
// function getAllReferencesToNodeSymbol(c: MovableDeclaration): ReferenceEntry[] {
//   const results: ReferenceEntry[] = []
//   for (const referencedSymbol of c.findReferences()) {
//     for (const reference of referencedSymbol.getReferences()) {
//       results.push(reference)
//     }
//   }
//   return results
// }
// /** creates a ImportDeclarationStructure from given ImportDeclaration */
// function importDeclaration2Structure(importDecl: ImportDeclaration): ImportDeclarationStructure {
//   let defImport: Identifier | undefined
//   let namedImport: ImportSpecifier[]
//   let namespaceImport: Identifier | undefined
//   let moduleSpecifier: StringLiteral
//   return {
//     namedImports: (namedImport = importDecl.getNamedImports()) && namedImport.map(ni => ni.getText()),
//     defaultImport: (defImport = importDecl.getDefaultImport()) && defImport.getText(),
//     namespaceImport: (namespaceImport = importDecl.getNamespaceImport()) && namespaceImport.getText(),
//     moduleSpecifier: importDecl.getModuleSpecifier().getText()
//   }
// }
