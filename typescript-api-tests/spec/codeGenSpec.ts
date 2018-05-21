import * as shell from 'shelljs'
import Project, {SourceFile, Node, Diagnostic} from 'ts-simple-ast'
import * as ts from 'typescript'

describe('method delegate interface', () => {
  let project
  const projectPath = `assets/sampleProject1_1_copy`;
  it(`interfaces`, () => {
    shell.rm(`-rf`, projectPath);
    shell.cp(`-r`, `assets/sampleProject1`, `${projectPath}`);
    project = new Project({
      tsConfigFilePath: `${projectPath}/tsconfig.json`
    });
  });

  it('Declare variable fix ', ()=>{
    const sourceFile = project.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
    const cursorPosition = 61
    const diags = getDiagnosticsInCurrentLocation(project, sourceFile, cursorPosition);
    if (!diags || !diags.length) {
      return fail();
    }
    const diag = diags[0];
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const fixes = codeFixes.filter(fix => fix.predicate(diag, child));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(diag, child);
    project.saveSync();
    project.emit();
    console.log('Project saved');
  })

  it('Declare constructor fix ', ()=>{
    const sourceFile = project.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
    const cursorPosition = 61
    const diags = getDiagnosticsInCurrentLocation(project, sourceFile, cursorPosition);
    if (!diags || !diags.length) {
      return fail();
    }
    const diag = diags[0];
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const fixes = codeFixes.filter(fix => fix.predicate(diag, child));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(diag, child);
    project.saveSync();
    project.emit();
    console.log('Project saved');
  })
  doAssert(projectPath);
});



const codeFixCreateVariable = {
  name: 'Declare variable',
  config: { variableType: 'const' },
  predicate: (diag: Diagnostic, child:Node):boolean => diag.getCode() === 2304 && // Cannot find name 'i'
    child.getKind() === ts.SyntaxKind.Identifier &&
    child.getParent().getKind() === ts.SyntaxKind.BinaryExpression &&
    child.getParent().getParent().getKind() === ts.SyntaxKind.ExpressionStatement,
  description: (diag: Diagnostic, child: Node) : string => `Declare variable "${child.getText()}"`,
  apply: (diag: Diagnostic, child: Node) => {
    child.getSourceFile().insertText(child.getStart(false), 'const '); 
  }
};


const codeFixCreateConstructor = {
  name: 'Declare constructor',
  config: { variableType: 'const' },
  predicate: (diag: Diagnostic, child:Node):boolean => diag.getCode() === 2554 && // Expected 0 arguments, but got 1
    child.getKind() === ts.SyntaxKind.Identifier &&
    child.getParent().getKind() === ts.SyntaxKind.BinaryExpression &&
    child.getParent().getParent().getKind() === ts.SyntaxKind.ExpressionStatement,
  description: (diag: Diagnostic, child: Node) : string => `Declare constructor "${child.getText()}"`,
  apply: (diag: Diagnostic, child: Node) => {
    // child.getSourceFile().insertText(child.getStart(false), 'const '); 
  }
};



const codeFixes = [
  codeFixCreateVariable
];

/** return the first diagnosis */
function getDiagnosticsInCurrentLocation(project, sourceFile, position) {
  const file = typeof sourceFile === 'string' ? project.getSourceFile(sourceFile) : sourceFile;
  return file.getDiagnostics().filter(d => d.getStart() <= position && position <= d.getStart() + d.getLength());
}
function doAssert(projectPath) {
  it('interface should contain delegate method signatures', () => {
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain('const i=f()')
  });
}





// export function findChildContainingPosition(sourceFile: SourceFile, position: number): Node | undefined {
//   let found:Node
//   function find(node:  Node, stop: ()=>void):void {
//     if (position >= node.getStart() && position < node.getEnd()) {
//       node.forEachChild(find)
//       if(!found){
//         found= node
//         stop()
//       }
//     }
//   }
//   find(sourceFile, ()=>{})
//   return found
// }