import Project, { ImportDeclaration, SourceFile, ClassDeclarationStructure, StatementedNode, PropertyDeclaration, ParameterDeclaration, ParameterDeclarationStructure } from "ts-simple-ast";
import { ClassDeclaration } from "ts-simple-ast";
import { preProcessFile } from "../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary";
import { cp, rm } from "shelljs";
import * as ts from 'typescript'
import { dirname, relative, basename, sep } from "path";

describe('playing with ts-simple-ast', () => {
  it('move a class to another file', () => {
   
    rm('-rf', 'assets/sampleProject1_copy')
    cp('-r', 'assets/sampleProject1', 'assets/sampleProject1_copy')
    const project = new Project({
      tsConfigFilePath: "assets/sampleProject1_copy/tsconfig.json"
    });
    const apple = searchClass(project, 'Apple')
    moveClass(apple, project, project.getSourceFiles().find(sf => sf.getFilePath().includes('usingApples.ts')))
  })
})


/**
 * Implement the move refactor, this is not just moving the class to given file but also updating, in given project, all references of import declarations that point to the class so they point to the new file and creating and removing import declarations pointing to all involved types inside class declaration. After the refactor project should not have compile errors and it shouldn't affect the execution in any way. The objective is refactor operation equivalent to those existent in Java/C# IDEs. 
 * @param c
 * @param project project in which to do the refactor
 * @param targetFile the target file, inside the project where to move the class
 */
function moveClass(c: ClassDeclaration, project: Project, targetFile: SourceFile) {
  project.removeSourceFile

  const importsReferencing = c.getReferencingNodes().filter(n =>
    n.getParent().getKind() === ts.SyntaxKind.ImportSpecifier)
    .map(n => n.getAncestors().find(p => p.getKind() == ts.SyntaxKind.ImportDeclaration)) as ImportDeclaration[]
  // TODO:  ts.SyntaxKind.ImportEqualsDeclaration - contemplate that kind of node

  importsReferencing.forEach(importDecl => {
    if (targetFile.getFilePath().toString() === importDecl.getSourceFile().getFilePath().toString()) {
      // the target file was importing the class itself - we need to remove that import cause class will be on it now
    }
    else {
      // let newModuleSpecifierValue = relative(dirname(importDecl.getSourceFile().getFilePath()), targetFile.getFilePath().toString())
      // newModuleSpecifierValue = newModuleSpecifierValue.includes('.ts') ? newModuleSpecifierValue.slice(0, newModuleSpecifierValue.indexOf('.ts')) : newModuleSpecifierValue
      // newModuleSpecifierValue = './' + soToImportPath(newModuleSpecifierValue)
      // importDecl.setModuleSpecifier(newModuleSpecifierValue)

      importDecl.setModuleSpecifier(targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory()))
      // targetFile.impor
    }
    // targetFile.getRelativePathAsModuleSpecifierTo(importDecl.getSourceFile().getDirectory())

  })


  //TODO: inside c , we could be using imported types - we must import these in the targetFile too if they are not already (cant repeat import). MUST!

  // add class to targetFile
  cloneClasses(targetFile, [c])

  // remove class from original file and organize import to remove unused ones
  c.remove()
  c.getSourceFile().organizeImports()
  project.saveSync()
}

function soToImportPath(p: string) {
  return sep === '\\' ? p.replace(/\\\\/g, '/') : p
}

function searchClass(project: Project, name: string): ClassDeclaration {
  let classFound
  // let sourceFile
  project.getSourceFiles().some(p => {
    classFound = p.getClass(name)
    if (classFound) {
      // sourceFile = p
      return true
    }
  })
  return classFound
}






export function cloneClasses(node: StatementedNode, classes: ClassDeclaration[]) {
  node.addClasses(classes.map(c => ({
    name: c.getName(),
    isExported: true,
    hasDeclareKeyword: true,
    typeParameters: c.getTypeParameters().map(p => ({
      name: p.getName(),
      constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
    })),
    docs: c.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
    extends: c.getExtends() ? c.getExtends().getText() : '',
    implements: c.getImplements() ? c.getImplements().map(i => i.getText()) : [],
    ctors: c.getConstructors().map(ctor => ({
      docs: ctor.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
      scope: ctor.hasScopeKeyword() ? ctor.getScope() : undefined,
      parameters: ctor.getParameters().map(p => mapParameter(p))
    })),
    properties: (c.getInstanceProperties() as PropertyDeclaration[]).map(nodeProp => ({
      name: nodeProp.getName(),
      type: nodeProp.getType().getText(),
      hasQuestionToken: nodeProp.hasQuestionToken(),
      scope: nodeProp.hasScopeKeyword() ? nodeProp.getScope() : undefined,
      docs: nodeProp.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") }))
    })),
    methods: c.getInstanceMethods().map(method => ({
      name: method.getName(),
      returnType: method.getReturnTypeNode() == null ? undefined : method.getReturnTypeNodeOrThrow().getText(),
      docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
      scope: method.hasScopeKeyword() ? method.getScope() : undefined,
      typeParameters: method.getTypeParameters().map(p => ({
        name: p.getName(),
        constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
      })),
      parameters: method.getParameters().map(p => mapParameter(p))
    }))
  })));

  function mapParameter(p: ParameterDeclaration): ParameterDeclarationStructure {
    return {
      name: p.getNameOrThrow(),
      hasQuestionToken: p.hasQuestionToken(),
      type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
      isRestParameter: p.isRestParameter(),
      scope: p.hasScopeKeyword() ? p.getScope() : undefined
    };
  }
}
