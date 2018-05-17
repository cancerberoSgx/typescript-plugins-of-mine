import Project, { ImportDeclaration, SourceFile, ClassDeclarationStructure, StatementedNode, PropertyDeclaration, 
  ParameterDeclaration, ParameterDeclarationStructure, printNode } from "ts-simple-ast";
import { ClassDeclaration } from "ts-simple-ast";
import { preProcessFile } from "../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary";
import { cp, rm } from "shelljs";
import * as ts from 'typescript'
import { dirname, relative, basename, sep } from "path";

/**
 * Implement the move refactor, this is not just moving the class to given file but also updating, in given project, all references of import declarations that point to the class so they point to the new file and creating and removing import declarations pointing to all involved types inside class declaration. After the refactor project should not have compile errors and it shouldn't affect the execution in any way. The objective is refactor operation equivalent to those existent in Java/C# IDEs. 
 * @param c the class declaration node to move
 * @param project project in which to do the refactor
 * @param targetFile the target file, inside the project where to move the class
 */
export function moveClass(c: ClassDeclaration, project: Project, targetFile: SourceFile) {

  moveClass_FixProjectImports(c, project, targetFile);
  moveClass_addImportsForEachReferenceInClassDecl(c, project, targetFile);

  // TODO: what with "export Apple from 'foo'"

  // add class to targetFile, at the beggining nd then exec organizeImports so imports go to the top automatically. Heads up - we cannot add the classs to the end because "class used before its declaration error"
  targetFile.getImportDeclarations()[targetFile.getImportDeclarations.length - 1]
  targetFile.insertText(targetFile.getStart(), c.getText() + '\n')
  targetFile.getSourceFile().organizeImports()

  // removes class from original file and organize import to remove unused ones
  c.remove()

  // removes imports to referenced types by class decl in old file.
  c.getSourceFile().organizeImports()  //TODO: add an import to c before organizeImport since other parts of the file could be reference c.
  project.saveSync()
}


function moveClass_addImportsForEachReferenceInClassDecl(c: ClassDeclaration, project: Project, targetFile: SourceFile) {
  // TODO: for each type referenced in class decl: import these in the targetFile too if they are not already (can't repeat import). MUST!

}

/**
 * move class refactor helper that, for each import decl in the entire project that import C, corrects the module specifier (file path)
 * @param c
 * @param project 
 * @param targetFile 
 */
function moveClass_FixProjectImports(c: ClassDeclaration, project: Project, targetFile: SourceFile) {

  // 

  const importsReferencing = c.getReferencingNodes().filter(n =>
    n.getParent().getKind() === ts.SyntaxKind.ImportSpecifier)
    .map(n => n.getAncestors().find(p => p.getKind() == ts.SyntaxKind.ImportDeclaration)) as ImportDeclaration[]

  // TODO:  ts.SyntaxKind.ImportEqualsDeclaration - contemplate that kind of node - i think it's import a = require('b')

  // TODO: contemplate import {x as y} from Y
  // TODO: contempoate import * as pp from Y

  importsReferencing.forEach(importDecl => {

    if (targetFile.getFilePath().toString() === importDecl.getSourceFile().getFilePath().toString()) {
      // the target file imports c - we need to remove that import cause class since it will be on it now
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
      importDecl.setModuleSpecifier(targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()))
    }
  })
}



