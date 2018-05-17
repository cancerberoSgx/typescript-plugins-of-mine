import Project, { ClassDeclaration, ImportDeclaration, SourceFile, Node } from "ts-simple-ast";
import * as ts from 'typescript';
import { debug } from "util";

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
export function moveClass(c: ClassDeclaration, project: Project, targetFile: SourceFile) {

  fixProjectImports(c, project, targetFile);
  addImportsForEachReferenceInClassDecl(c, project, targetFile);

  // TODO: what with "export Apple from 'foo'" TODO: what if original file was exporting with other name: 
  // export class Apple{...} as OtherName ??

  // add class to targetFile, at the beggining nd then exec organizeImports so imports go to the top automatically.
  // Heads up - we cannot add the classs to the end because "class used before its declaration error"
  targetFile.getImportDeclarations()[targetFile.getImportDeclarations.length - 1]
  targetFile.insertText(targetFile.getStart(), c.getText() + '\n')
  targetFile.getSourceFile().organizeImports()

  // removes class from original file and organize import to remove unused ones
  c.remove()

  // removes imports to referenced types by class decl in old file. 
  // TODO: add an import to c before organizeImport since other parts of the file could be reference c.
  c.getSourceFile().organizeImports()  

  project.saveSync()
}


function addImportsForEachReferenceInClassDecl(c: ClassDeclaration, project: Project, targetFile: SourceFile) {
  
  // TODO: support Apple{prop1: Array<Array<ReferencedType>>}
  // TODO: for each type referenced in class decl: import these in the targetFile too if they are not already (can't
  // repeat import). MUST!

  const toImportInTarget: {symbolName: string, declarationName: string, file: SourceFile}[] = []

  c.forEachDescendant((node: Node, stop: () => void)=>{
    if(node.getSymbol() && node.getSymbol().getName() && node.getType()  && node.getSymbol().getName()!=c.getName()) {

      // const cc =      project.getTypeChecker().getTypeAtLocation(node)//.getBaseTypes()
      // const valueDeclMaybe = cc.getSymbol() && cc.getSymbol().getValueDeclaration() &&  cc.getSymbol().getValueDeclaration() 
      // if(valueDeclMaybe && (valueDeclMaybe as any).getName){
      //   debugger
      //   console.log((valueDeclMaybe as any).getName() + '#' + valueDeclMaybe.getSourceFile().getFilePath())
      // }


      // const valueDecl
      // as ts.NamedDeclaration.getKindName().endsWith('Declaration').getName as declar
      // if(valueDecl){
      //   console.log(valueDecl.)
//       }.getSourceFile().getFilePath()
// "/home/sg/git/typescript-plugins-of-mine/typescript-api-tests/assets/sampleProject1_copy/src/model/fruit.ts"
// cc.getSymbol().getValueDeclaration().getName()


     //.compilerType.symbol.getDeclarations() 
      
      // let typename = node.getSymbol().getDeclaredType() && node.getSymbol().getDeclaredType().compilerType && node.getSymbol().getDeclaredType()&& node.getSymbol().getDeclaredType().getSymbol()&& node.getSymbol().getDeclaredType().getSymbol().getName()//.getTargetType() && node.getSymbol().getDeclaredType().getTargetType().getText()//.getName()//getText()
      // debugger
      // && node.getSymbol().getDeclaredType().compilerType.symbol.getDeclarations()[0] && node.getSymbol().getDeclaredType().compilerType.symbol.getDeclarations()

 
//  cc.getSymbol().getValueDeclaration().getName()

//  cc.getSymbol().getValueDeclaration().getSourceFile().getFilePath()
//  debugger;

      let declaredTypeDecls = node.getSymbol() && node.getSymbol().getDeclaredType() && node.getSymbol().getDeclaredType().compilerType && node.getSymbol().getDeclaredType() && node.getSymbol().getDeclaredType().getSymbol() && node.getSymbol().getDeclaredType().getSymbol().getDeclarations()

      

      if(declaredTypeDecls && declaredTypeDecls.length){
        declaredTypeDecls
        .filter(d=>!d.getSourceFile().compilerNode.hasNoDefaultLib) // filter natives like Array from node_modules/typescript/lib/lib.es5.d.ts - 
        .forEach(d=>{
          toImportInTarget.push({file: d.getSourceFile(), symbolName: node.getSymbol().getName(), declarationName: d.getSymbol().getName()})
        })
        // d.getSourceFile().getFilePath().replace('/home/sg/git/typescript-plugins-of-mine/typescript-api-tests/', '') + ' - '+node.getText() + ' - '+d.getSourceFile().compilerNode.hasNoDefaultLib).join(', ')
        
        // debugger
//         declaredTypeDecls.map(d=>{
//           debugger;
//         })
      }


      // console.log(
      //   node.getSymbol() && node.getSymbol().getName()+' - '  +(node.getType() && node.getType().getText() + ' - '+ node.getType().getTargetType() + ' - '+
      // (declaredTypeDecls && declaredTypeDecls.length && declaredTypeDecls.map(d=>d.getSourceFile().getFilePath().replace('/home/sg/git/typescript-plugins-of-mine/typescript-api-tests/', '') + ' - '+node.getText() + ' - '+d.getSourceFile().compilerNode.hasNoDefaultLib).join(', '))
      // )
  // )
      
    }
   
  })

  console.log(toImportInTarget.map(n=>n.symbolName+'-'+n.symbolName+'-'+n.file.getFilePath()));
  
}

/**
 * Move class refactor helper that, for each import decl in the entire project that import C, corrects the module
 * specifier (file path)
 * @param c
 * @param project 
 * @param targetFile 
 */
function fixProjectImports(c: ClassDeclaration, project: Project, targetFile: SourceFile) {
  const importsReferencing = c.getReferencingNodes().filter(n =>
    n.getParent().getKind() === ts.SyntaxKind.ImportSpecifier)
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



