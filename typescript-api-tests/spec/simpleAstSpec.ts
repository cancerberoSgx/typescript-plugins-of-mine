import Project, { ImportDeclaration, SourceFile, ClassDeclarationStructure, StatementedNode, PropertyDeclaration, ParameterDeclaration, ParameterDeclarationStructure, printNode } from "ts-simple-ast";
import { ClassDeclaration } from "ts-simple-ast";
import { preProcessFile } from "../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary";
import { cp, rm } from "shelljs";
import * as ts from 'typescript'
import { dirname, relative, basename, sep } from "path";
import { moveClass } from "../src/moveClass";

describe('playing with ts-simple-ast', () => {
  it('move a class to another file', () => {

    rm('-rf', 'assets/sampleProject1_copy')
    cp('-r', 'assets/sampleProject1', 'assets/sampleProject1_copy')
    const project = new Project({
      tsConfigFilePath: "assets/sampleProject1_copy/tsconfig.json"
    });
    const apple = getTopLevelClassNamed(project, 'Apple')
    moveClass(apple, project, project.getSourceFiles().find(sf => sf.getFilePath().includes('usingApples.ts')))
    // TODO: expect apple.js  dont have classs anymore and any import referencing c internls
    // TODO: expect usingAPples.ts has the class and new imports
    // TODO: expect(tools.ts import apple from new file
    // TODOexpect project compiles OK dont have diagnostic warnings
  })
})

function getTopLevelClassNamed(project: Project, name: string): ClassDeclaration {
  let classFound
  project.getSourceFiles().some(p => {
    classFound = p.getClass(name)
    if (classFound) {
      return true
    }
  })
  return classFound
}







// function soToImportPath(p: string) {
//   return sep === '\\' ? p.replace(/\\\\/g, '/') : p
// }


  // cloneClasses(targetFile, [c]) // works but is safer to write string
// export function cloneClasses(node: StatementedNode, classes: ClassDeclaration[]) {
//   node.addClasses(classes.map(c => ({
//     name: c.getName(),
//     isExported: true,
//     hasDeclareKeyword: true,
//     typeParameters: c.getTypeParameters().map(p => ({
//       name: p.getName(),
//       constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
//     })),
//     docs: c.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
//     extends: c.getExtends() ? c.getExtends().getText() : '',
//     implements: c.getImplements() ? c.getImplements().map(i => i.getText()) : [],
//     ctors: c.getConstructors().map(ctor => ({
//       docs: ctor.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
//       scope: ctor.hasScopeKeyword() ? ctor.getScope() : undefined,
//       parameters: ctor.getParameters().map(p => mapParameter(p))
//     })),
//     properties: (c.getInstanceProperties() as PropertyDeclaration[]).map(nodeProp => ({
//       name: nodeProp.getName(),
//       type: nodeProp.getType().getText(),
//       hasQuestionToken: nodeProp.hasQuestionToken(),
//       scope: nodeProp.hasScopeKeyword() ? nodeProp.getScope() : undefined,
//       docs: nodeProp.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") }))
//     })),
//     methods: c.getInstanceMethods().map(method => ({
//       name: method.getName(),
//       returnType: method.getReturnTypeNode() == null ? undefined : method.getReturnTypeNodeOrThrow().getText(),
//       docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
//       scope: method.hasScopeKeyword() ? method.getScope() : undefined,
//       typeParameters: method.getTypeParameters().map(p => ({
//         name: p.getName(),
//         constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
//       })),
//       parameters: method.getParameters().map(p => mapParameter(p))
//     }))
//   })));

//   function mapParameter(p: ParameterDeclaration): ParameterDeclarationStructure {
//     return {
//       name: p.getNameOrThrow(),
//       hasQuestionToken: p.hasQuestionToken(),
//       type: p.getTypeNode() == null ? undefined : p.getTypeNodeOrThrow().getText(),
//       isRestParameter: p.isRestParameter(),
//       scope: p.hasScopeKeyword() ? p.getScope() : undefined
//     };
//   }
// }
