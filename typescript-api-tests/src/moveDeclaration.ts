import Project, { ClassDeclaration, EnumDeclaration, FunctionDeclaration, ImportDeclaration, InterfaceDeclaration, Node, SourceFile, VariableDeclaration, ExportableNodeStructure, ImportDeclarationStructure } from "ts-simple-ast";
import * as ts from 'typescript';
/**meaning that it moved by this refactor */
export type MovableDeclaration = ClassDeclaration | FunctionDeclaration | InterfaceDeclaration | VariableDeclaration | EnumDeclaration
/**
 *
 * Moves a top level declaration to another file.
 * 
 * 
 * **Very WIP dont use it in production yet!**
 * 
 * The resulting project state should not have errors. We do two important things: 
 * 
 * 1) fix all imports pointing to target declaration in all files of the project so they point now to the new
 *    location (target file)
 * 2) all nodes referenced inside the target declaration must be now imported in the target file (so the
 *    declaration can still see them)
 * 
 *
 * See all todo comments along the code to  get idea of current state / issue
 *
 * @param c the class declaration node to move
 * @param project project in which to do the refactor
 * @param targetFile the target file, inside the project where to move the class
 */
export function moveDeclaration(c: MovableDeclaration, project: Project, targetFile: SourceFile) {

  let modifiedFiles: { [key: string]: SourceFile } = {}
  if ((c as ExportableNodeStructure).isExported) {
    //if c is not exported then we dont need to perform fixProjectImports
    modifiedFiles = fixProjectImports(c, project, targetFile);
  }
  const originalFile = c.getSourceFile()

  // TODO: support / test exports with custom names like :  "export $DECLARATION as OtherName ""

  // write declaration at the beggining of taret file making sure it's exported
  let declarationText = c.getText()
  declarationText.trim().startsWith('export') ? declarationText : 'export ' + declarationText
  declarationText = declarationText + '\n'
  targetFile.addStatements(declarationText)
  // targetFile.insertText(targetFile.getStart(), declarationText)
  targetFile.saveSync()
  project.saveSync()

  // removes class from original file
  c.remove()
  project.saveSync()

  //add necessary imports in target file so declaration has its dependencies: 
  addDeclarationDependencyImportsToTargetFile(originalFile, project, targetFile)

  project.saveSync()
  // now we call organizeImports on all required files, target, original and all the ones where we added imports
  //organize imports in target file (clean unused/duplicated)
  targetFile.organizeImports()

  project.saveSync()
  originalFile.organizeImports()  //remove unused imports

  project.saveSync()
  Object.values(modifiedFiles).forEach(file => {
    //   file.saveSync()
    file.organizeImports()
  });

  project.saveSync()
}


/** 
 * For each reference inside target declaration we will need to import it in targetFile. 
 * 
 * TODO: we only consider imported declaration dependencies. but not dependencies in original file. 
 * Two alternatives:
 * we can move them too or we can export them and import them in the targe file. (configurable?)
  */
function addDeclarationDependencyImportsToTargetFile(originalFile: SourceFile, project: Project, targetFile: SourceFile) {
  const imports: ImportDeclaration[] = []
  const importStructures: ImportDeclarationStructure[] = []
  originalFile.forEachDescendant(d => {
    if (d.getKind() === ts.SyntaxKind.ImportDeclaration) {

      const importDecl = d as ImportDeclaration

      let moduleSpecifierSourceFile

      // importDecl.setModuleSpecifier(
      //   targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' + ((moduleSpecifierSourceFile = importDecl.getModuleSpecifierSourceFile()) && moduleSpecifierSourceFile.getBaseNameWithoutExtension()))

      // importDecl.getSourceFile().saveSync()

      // imports.push(importDecl)
      // let moduleSpecifierSourceFile
      // const moduleSpecifier = targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' + ((moduleSpecifierSourceFile = importDecl.getModuleSpecifierSourceFile()) && moduleSpecifierSourceFile.getBaseNameWithoutExtension())


      // console.log(importDecl.getText(), moduleSpecifier)
      const importDeclStructure = node2Structure(importDecl)
      importDeclStructure.moduleSpecifier = targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' + ((moduleSpecifierSourceFile = importDecl.getModuleSpecifierSourceFile()) && moduleSpecifierSourceFile.getBaseNameWithoutExtension())
      importStructures.push(importDeclStructure)

      // console.log( '*****', targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' + ((  moduleSpecifierSourceFile    =importDecl.getModuleSpecifierSourceFile()) && moduleSpecifierSourceFile.getBaseNameWithoutExtension()), '*****')
      // console.log( '*****', importDecl.getSourceFile().getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) + '/' + importDecl.getSourceFile().getBaseNameWithoutExtension(), '*****')
      // targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' + targetFile.getBaseNameWithoutExtension())

    }
  })
  // project.saveSync()
  // targetFile.saveSync()
  // targetFile.insertText(targetFile.getStart(), imports.map(i => i.print()).join(';'))

  // imports.forEach(i => {
  //   targetFile.addStatements(i.print())
  //   targetFile.saveSync()
  // })
  // project.saveSync()
  //i.getText()).join('\n'))
  importStructures.forEach(is => {
    targetFile.addImportDeclarations(importStructures)
  })
}

function node2Structure(importDecl: ImportDeclaration): ImportDeclarationStructure {
  let defImport, namedImport, namespaceImport, moduleSpecifier
  return { namedImports: (namedImport = importDecl.getNamedImports()) && namedImport.map(ni => ni.getText()), defaultImport: (defImport = importDecl.getDefaultImport()) && defImport.getText(), namespaceImport: (namespaceImport = importDecl.getNamespaceImport()) && namespaceImport.getText(), moduleSpecifier: importDecl.getModuleSpecifier().getText() }//.toString()}//(moduleSpecifier=importDecl.getModuleSpecifier())&&moduleSpecifier}
}
/**
 * Search where target declaration is being imported, in the entire project, and update the imports
 * so it points to the new location (targetFile)
 * @param c
 * @param project 
 * @param targetFile 
 */
function fixProjectImports(c: MovableDeclaration, project: Project, targetFile: SourceFile): { [key: string]: SourceFile } {
  let parent
  const importsReferencing = c.getReferencingNodes().filter(n =>
    (parent = n.getParent()) && parent.getKind() === ts.SyntaxKind.ImportSpecifier)
    .map(n => n.getAncestors().find(p => p.getKind() == ts.SyntaxKind.ImportDeclaration)) as ImportDeclaration[]

  // TODO:  ts.SyntaxKind.ImportEqualsDeclaration - contemplate that kind of node - i think it's import a =
  // require('b')

  // TODO: contemplate import {x as y} from Y 

  // TODO: contempoate import * as pp from Y

  // TODO: contemplate internal classes (not classes declared inside functions for ex)

  const importsFiles: { [key: string]: SourceFile } = {}
  importsReferencing.forEach(importDecl => {

    if (targetFile.getFilePath().toString() === importDecl.getSourceFile().getFilePath().toString()) {
      // targetFile imports c - we need to remove that import cause class since it will be on it now
      targetFile.getImportDeclarations().forEach(i => {
        const importSpecifierToC = i.getNamedImports().find(ni => ni.getText() === c.getName())
        if (importSpecifierToC) {
          importSpecifierToC.remove()
          // importSpecifierToC.getSourceFile().saveSync()
        }
        if (i.getNamedImports().length === 0) {
          i.remove()
          // i.getSourceFile().saveSync()
        }
      })
    }
    else {
      importDecl.setModuleSpecifier(importDecl.getSourceFile().getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) + '/' + targetFile.getBaseNameWithoutExtension())
      // importDecl.getSourceFile().saveSync()
    }
    importsFiles[importDecl.getSourceFile().getFilePath()] = importDecl.getSourceFile()
  });
  return importsFiles
}










// //TODO: maybe there is a very easy way of accomplih this and it's just copy&paste all imports from source
// //file to dest file and then just organize imports.!!!
// function addImportsForEachReferenceInClassDecl(c: MovableDeclaration, project: Project, targetFile: SourceFile) {

//   // TODO: support Apple{prop1: Array<Array<ReferencedType>>}
//   // TODO: for each type referenced in class decl: import these in the targetFile too if they are not already (can't
//   // repeat import). MUST!

//   // debugger;
//   const imports: ImportDeclaration[] = []
//   c.getSourceFile().forEachDescendant(d=>{
//     if(d.getKind()===ts.SyntaxKind.ImportDeclaration){
//       imports.push(d as ImportDeclaration)
//     }
//   })


//   // const imports = c.getSourceFile().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration)
//   // const originalFileImports = c.getSourceFile().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration)
//   targetFile.insertText(targetFile.getStart(), imports.map(i => i.getText()).join('\n'))
//   // targetFile.organizeImports()

//   // const toImportInTarget: {
//   //   symbolName: string,
//   //   declarationName: string | undefined,
//   //   originalImport: ImportDeclaration | undefined,
//   //   originalFile: SourceFile,
//   //   node: Node,
//   //   typeDeclaration: Node
//   // }[] = []

//   // c.forEachDescendant((node: Node, stop: () => void) => {
//   //   const nodeSymbol = node.getSymbol()
//   //   let typeSymbol
//   //   if (nodeSymbol && nodeSymbol.getName() && nodeSymbol.getName() !== c.getName()) {

//   //     let declaredTypeDecls = nodeSymbol && nodeSymbol.getDeclaredType() &&
//   //       (typeSymbol = nodeSymbol.getDeclaredType().getSymbol()) && typeSymbol.getDeclarations()

//   //     if (declaredTypeDecls && declaredTypeDecls.length) {
//   //       declaredTypeDecls
//   //         .filter(d => !d.getSourceFile().compilerNode.hasNoDefaultLib) // filter natives like Array from node_modules/typescript/lib/lib.es5.d.ts - 
//   //         .forEach(d => {
//   //           //TODO: what happen if there are more than one namedimports ? is that possible ? currently we take first one
//   //           const originalImport = node.getSourceFile()
//   //             .getImportDeclaration(i => !!i.getNamedImports().find(ni => ni.getName() == nodeSymbol.getName()))

//   //           let declSyntaxList
//   //           let declSymbol

//   //           // we shoulnd' worry about non exported declarations : if not exported then nobody imports them: 
//   //           // // if the type is not imported and and is not exported then we need to export it automatically. We cannot test
//   //           // // this with apple example - test moving a non exported declaration. 
//   //           //     if(!originalImport && !(d as ExportableNodeStructure).isExported){
//   //           //       (d as any).setIsExported && (d as any).setIsExported(true) // TODO: got tired of types so ugly casting here temporarily
//   //           //     }
//   //           toImportInTarget.push({
//   //             symbolName: nodeSymbol.getName(),
//   //             declarationName: (declSymbol = d.getSymbol()) && declSymbol.getName(),
//   //             originalImport,
//   //             node, typeDeclaration: d,
//   //             originalFile: c.getSourceFile()
//   //           })
//   //         })
//   //     }
//   //   }
//   // })

//   // // console.log(toImportInTarget.map(n=>n.typeDeclaration.getKindName()+'-'+n.symbolName+'-'+n.declarationName+'-'+(n.originalImport &&n.originalImport.getText())))

//   // // At this point, we are ready to add the imports in target file in toImportInTarget we have all the imports that we must add in targetFile. ready to add 

//   // toImportInTarget.forEach(toImport => {


//   // })


//   //TODO: do it

// }
