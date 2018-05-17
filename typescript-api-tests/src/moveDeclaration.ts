import Project, { ClassDeclaration, EnumDeclaration, FunctionDeclaration, ImportDeclaration, InterfaceDeclaration, Node, SourceFile, VariableDeclaration, ExportableNodeStructure } from "ts-simple-ast";
import * as ts from 'typescript';

export type Movable = ClassDeclaration | FunctionDeclaration | InterfaceDeclaration | VariableDeclaration | EnumDeclaration
/**
 * TODO: MOST: IMPORTANT dont reduce this only to classes - can we move other decls like functions / interfaces, etc? -
 * I think so! change name to moveDeclaration !
 *
 * Implement the move refactor, this is not just moving the class to given file. The resulting project state should not
 * have errors. Among other things, beside just moving the class to another file, all all project's import declarations
 * are updated to point the new class location. lso imports to referenced types in class will be added / removed to
 * files that require it. The objective is refactor operation equivalent to those existent in Java/C# IDEs. 
 *
 * See all todo comments along the code to  get idea of current state / issue
 *
 * @param c the class declaration node to move
 * @param project project in which to do the refactor
 * @param targetFile the target file, inside the project where to move the class
 */
export function moveDeclaration(c: Movable, project: Project, targetFile: SourceFile) {

  if ((c as ExportableNodeStructure).isExported) {
    //if c is not exported then we dont need to perform fixProjectImports
    fixProjectImports(c, project, targetFile);
  }
  addImportsForEachReferenceInClassDecl(c, project, targetFile);


  // TODO: what with "export Apple from 'foo'" TODO: what if original file was exporting with other name: 
  // export class Apple{...} as OtherName ??

  // add class to targetFile, at the beggining nd then exec organizeImports so imports go to the top automatically.
  // Heads up - we cannot add the classs to the end because "class used before its declaration error"
  targetFile.getImportDeclarations()[targetFile.getImportDeclarations.length - 1]
  let  declarationText = c.getText()
  declarationText.trim().startsWith('export') ? declarationText : 'export '+declarationText
  // we make sure declaration is exported in target file
  targetFile.insertText(targetFile.getStart(), declarationText + '\n')

  c.remove()// removes class from original file and 
  targetFile.getSourceFile().organizeImports() // organize import to remove unused ones
 
  c.getSourceFile().organizeImports() // removes imports to referenced types by class decl in old file. 

  project.saveSync()
}


  //TODO: maybe there is a very easy way of accomplih this and it's just copy&paste all imports from source
  //file to dest file and then just organize imports.!!!
function addImportsForEachReferenceInClassDecl(c: Movable, project: Project, targetFile: SourceFile) {

  // TODO: support Apple{prop1: Array<Array<ReferencedType>>}
  // TODO: for each type referenced in class decl: import these in the targetFile too if they are not already (can't
  // repeat import). MUST!

  const imports = c.getSourceFile().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration)
 targetFile.insertText(targetFile.getStart(), c.getSourceFile().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration).map(i=>i.getText()).join('\n'))
 targetFile.organizeImports()

  // const toImportInTarget: {
  //   symbolName: string,
  //   declarationName: string | undefined,
  //   originalImport: ImportDeclaration | undefined,
  //   originalFile: SourceFile,
  //   node: Node,
  //   typeDeclaration: Node
  // }[] = []

  // c.forEachDescendant((node: Node, stop: () => void) => {
  //   const nodeSymbol = node.getSymbol()
  //   let typeSymbol
  //   if (nodeSymbol && nodeSymbol.getName() && nodeSymbol.getName() !== c.getName()) {

  //     let declaredTypeDecls = nodeSymbol && nodeSymbol.getDeclaredType() &&
  //       (typeSymbol = nodeSymbol.getDeclaredType().getSymbol()) && typeSymbol.getDeclarations()

  //     if (declaredTypeDecls && declaredTypeDecls.length) {
  //       declaredTypeDecls
  //         .filter(d => !d.getSourceFile().compilerNode.hasNoDefaultLib) // filter natives like Array from node_modules/typescript/lib/lib.es5.d.ts - 
  //         .forEach(d => {
  //           //TODO: what happen if there are more than one namedimports ? is that possible ? currently we take first one
  //           const originalImport = node.getSourceFile()
  //             .getImportDeclaration(i => !!i.getNamedImports().find(ni => ni.getName() == nodeSymbol.getName()))

  //           let declSyntaxList
  //           let declSymbol

  //           // we shoulnd' worry about non exported declarations : if not exported then nobody imports them: 
  //           // // if the type is not imported and and is not exported then we need to export it automatically. We cannot test
  //           // // this with apple example - test moving a non exported declaration. 
  //           //     if(!originalImport && !(d as ExportableNodeStructure).isExported){
  //           //       (d as any).setIsExported && (d as any).setIsExported(true) // TODO: got tired of types so ugly casting here temporarily
  //           //     }
  //           toImportInTarget.push({
  //             symbolName: nodeSymbol.getName(),
  //             declarationName: (declSymbol = d.getSymbol()) && declSymbol.getName(),
  //             originalImport,
  //             node, typeDeclaration: d,
  //             originalFile: c.getSourceFile()
  //           })
  //         })
  //     }
  //   }
  // })

  // // console.log(toImportInTarget.map(n=>n.typeDeclaration.getKindName()+'-'+n.symbolName+'-'+n.declarationName+'-'+(n.originalImport &&n.originalImport.getText())))

  // // At this point, we are ready to add the imports in target file in toImportInTarget we have all the imports that we must add in targetFile. ready to add 

  // toImportInTarget.forEach(toImport => {


  // })


  //TODO: do it

}

/**
 * Move class refactor helper that, for each import decl in the entire project that import C, corrects the module
 * specifier (file path)
 * @param c
 * @param project 
 * @param targetFile 
 */
function fixProjectImports(c: Movable, project: Project, targetFile: SourceFile) {
  let parent
  const importsReferencing = c.getReferencingNodes().filter(n =>
    (parent = n.getParent()) && parent.getKind() === ts.SyntaxKind.ImportSpecifier)
    .map(n => n.getAncestors().find(p => p.getKind() == ts.SyntaxKind.ImportDeclaration)) as ImportDeclaration[]

  // TODO:  ts.SyntaxKind.ImportEqualsDeclaration - contemplate that kind of node - i think it's import a =
  // require('b')

  // TODO: contemplate import {x as y} from Y 

  // TODO: contempoate import * as pp from Y

  // TODO: contemplate internal classes (not classes declared inside functions for ex)

  importsReferencing.forEach(importDecl => {

    if (targetFile.getFilePath().toString() === importDecl.getSourceFile().getFilePath().toString()) {
      // targetFile imports c - we need to remove that import cause class since it will be on it now
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
      importDecl.setModuleSpecifier(importDecl.getSourceFile().getRelativePathAsModuleSpecifierTo(targetFile.getDirectory()) + '/' + targetFile.getBaseNameWithoutExtension())
    }
    importDecl.getSourceFile().organizeImports()
  })
}



