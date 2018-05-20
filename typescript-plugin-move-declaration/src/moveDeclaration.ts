import Project, {
  ClassDeclaration, EnumDeclaration, FunctionDeclaration, ImportDeclaration, InterfaceDeclaration,
  Node, SourceFile, VariableDeclaration, ExportableNodeStructure, ImportDeclarationStructure, ClassDeclarationStructure,
  Identifier, ImportSpecifier, StringLiteral, ReferenceEntry, TypeGuards
} from "ts-simple-ast";
import * as ts from 'typescript';
import { basename } from "path";

/**meaning that it moved by this refactor */
export type MovableDeclaration = ClassDeclaration | FunctionDeclaration | InterfaceDeclaration |
  VariableDeclaration | EnumDeclaration


export function moveDeclarationNamed(declarationName: string, file: SourceFile, project: Project, targetFile: SourceFile) {
  let found: MovableDeclaration
  file.forEachDescendant((child, stop) => { // TODO: check is top-level
    if (child.getKindName().endsWith('Declaration') && ((child as any).getName && (child as MovableDeclaration).getName()) === declarationName) {
      found = child as MovableDeclaration;
      stop()
    }
  })
  if (!found) {
    throw new Error(`declaration named ${declarationName} not found in file ${file.getFilePath()}`)
  }
  return moveDeclaration(found as MovableDeclaration, project, targetFile)
}

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
 * See all todo comments along the code to  get idea of current state / issue
 *
 * @param c the declaration node to move
 * @param project project in which to do the refactor
 * @param targetFile the target file, inside the project where to move the class
 */
export function moveDeclaration(c: MovableDeclaration, project: Project, targetFile: SourceFile) {
  const originalFile = c.getSourceFile()

  // write declaration at the beggining of target file making sure it's exported
  let declarationText = c.getText()
  declarationText.trim().startsWith('export') ? declarationText : 'export ' + declarationText
  declarationText = declarationText + '\n'
  targetFile.insertStatements(0, declarationText)


  // add necessary imports in target file so declaration has its dependencies: 
  addDeclarationDependencyImportsToTargetFile(originalFile, project, targetFile, c)


  let modifiedFiles: { [key: string]: SourceFile } = {}
  if ((c as ExportableNodeStructure).isExported) {
    // if c is not exported then we dont need to perform fixProjectImports
    modifiedFiles = fixProjectImports(c, project, targetFile, originalFile);
  }
  // TODO: support / test exports with custom names like :  "export $DECLARATION as OtherName ""


  c.remove()
  c = null

  // now we call organizeImports on all required files, target, original and all the ones where we added imports
  // organize imports in all files which imports decls where modified (clean unused/duplicated)
  targetFile.organizeImports()
  originalFile.organizeImports()
  Object.values(modifiedFiles).forEach(file => {
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
function addDeclarationDependencyImportsToTargetFile(originalFile: SourceFile, project: Project,
  targetFile: SourceFile, c: MovableDeclaration) {
  const imports: ImportDeclaration[] = []
  const importStructures: ImportDeclarationStructure[] = []
  originalFile.forEachDescendant(d => {
    if (d.getKind() === ts.SyntaxKind.ImportDeclaration) {
      const importDecl = d as ImportDeclaration
      let moduleSpecifierSourceFile
      // create a importDeclStructure and reassign the moduleSpecifier to the correct path
      const importDeclStructure = importDeclaration2Structure(importDecl)
      importDeclStructure.moduleSpecifier =
        targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()) + '/' +
        ((moduleSpecifierSourceFile = importDecl.getModuleSpecifierSourceFile()) &&
          moduleSpecifierSourceFile.getBaseNameWithoutExtension())
      importStructures.push(importDeclStructure)
    }
  })
  // console.log(  'sehshshs', originalFile.getDescendantStatements().filter(s=>ts.SyntaxKind.TypeAliasDeclaration === s.getKind()) .map(d=>d.getKindName()).join(', '))//  getDescendantsOfKind(ts.Syn)
  //   // The same for all types referenced inside declaration
  //   // c.forEachDescendant(d=>{
  //   //   if(TypeGuards.isTypeReferenceNode(d)){
  //   //     debugger
  //   //     d.getType()
  //   //   }
  //     // if(d.getText().includes('AppleTree')){
  //     //   debugger
  //     // }
  //     // d.getType    
  //   // })
  importStructures.forEach(is => {
    targetFile.insertImportDeclarations(0, importStructures)
  })
}

/**
 * Search where target declaration is being imported, in the entire project, and update the imports
 * so it points to the new location (targetFile)
 * @param c
 * @param project 
 * @param targetFile 
 */
function fixProjectImports(c: MovableDeclaration, project: Project, targetFile: SourceFile,
  originalFile: SourceFile): { [key: string]: SourceFile } {
  let parent

  const importsReferencing = getAllReferencesToNodeSymbol(c).map(r => r.getNode())
    .filter(n => (parent = n.getParent()) && parent.getKind() === ts.SyntaxKind.ImportSpecifier)
    .map(n => n.getAncestors().find(p => p.getKind() == ts.SyntaxKind.ImportDeclaration)) as ImportDeclaration[]

  // TODO:  ts.SyntaxKind.ImportEqualsDeclaration - contemplate that kind of node - i think it's import a =
  // require('b')
  // TODO: contemplate import {x as y} from Y 
  // TODO: contempoate import * as pp from Y
  // TODO: contemplate internal classes (not classes declared inside functions for ex)

  let oneImportTargetDeclaration
  const importsFiles: { [key: string]: SourceFile } = {}
  importsReferencing.forEach(importDecl => {

    if (targetFile.getFilePath().toString() === importDecl.getSourceFile().getFilePath().toString()) {
      // targetFile imports c - we need to remove that import because now declaration will be here
      targetFile.getImportDeclarations().forEach(i => {
        const importSpecifierToC = i.getNamedImports().find(ni => ni.getText() === c.getName())
        if (importSpecifierToC) {
          importSpecifierToC.remove()
        }
        if (i.getNamedImports().length === 0) {
          i.remove()
        }
      })
    }
    else {
      importDecl.setModuleSpecifier(importDecl.getSourceFile().
        getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) + '/' + targetFile.getBaseNameWithoutExtension())
      oneImportTargetDeclaration = importDecl
    }
    importsFiles[importDecl.getSourceFile().getFilePath()] = importDecl.getSourceFile()
  });

  // Also we want to import declaration in original file (cause other parts of the file could still being
  // referencing it.). We take advantage of these import decls here and do it here... 
  const importDeclStructure = importDeclaration2Structure(oneImportTargetDeclaration);

  importDeclStructure.moduleSpecifier = originalFile.getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) +
    '/' + targetFile.getBaseNameWithoutExtension()

  originalFile.addImportDeclaration(importDeclStructure)
  importsFiles[originalFile.getFilePath()] = originalFile
  return importsFiles
}

// utilities

/**
 * I don't know why, but this will return more results than just c.getReferencingNodes() and is what I need
 * now. 
 * TODO: investigate why and contribute
 */
function getAllReferencesToNodeSymbol(c: MovableDeclaration): ReferenceEntry[] {
  const results: ReferenceEntry[] = []
  for (const referencedSymbol of c.findReferences()) {
    for (const reference of referencedSymbol.getReferences()) {
      results.push(reference)
    }
  }
  return results
}
/**
 * @param importDecl creates a ImportDeclarationStructure from given ImportDeclaration
 */
function importDeclaration2Structure(importDecl: ImportDeclaration): ImportDeclarationStructure {
  let defImport: Identifier | undefined
  let namedImport: ImportSpecifier[]
  let namespaceImport: Identifier | undefined
  let moduleSpecifier: StringLiteral
  return {
    namedImports: (namedImport = importDecl.getNamedImports()) && namedImport.map(ni => ni.getText()),
    defaultImport: (defImport = importDecl.getDefaultImport()) && defImport.getText(),
    namespaceImport: (namespaceImport = importDecl.getNamespaceImport()) && namespaceImport.getText(),
    moduleSpecifier: importDecl.getModuleSpecifier().getText()
  }
}