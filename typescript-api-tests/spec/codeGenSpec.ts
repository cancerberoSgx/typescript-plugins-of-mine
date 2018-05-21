import * as shell from 'shelljs'
import Project, {SourceFile, Node, Diagnostic} from 'ts-simple-ast'
import * as ts from 'typescript'

describe('method delegate interface', () => {
  const projectPath = `assets/sampleProject1_1_copy`;
  it(`interfaces`, () => {
    shell.rm(`-rf`, projectPath);
    shell.cp(`-r`, `assets/sampleProject1`, `${projectPath}`);
    const project = new Project({
      tsConfigFilePath: `${projectPath}/tsconfig.json`
    });
    const sourceFile = project.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
    const diags = getDiagnosticsInCurrentLocation(project, sourceFile, 61);
    if (!diags || !diags.length) {
      return fail();
    }
    const diag = diags[0];
    const child = sourceFile.getDescendantAtPos(61);
    // const stmt = child.getAncestors().find(anc => anc.getKind() === ts.SyntaxKind.ExpressionStatement);
    const fixes = codeFixes.filter(fix => fix.predicate(diag, child));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(diag, child);
    // sourceFile.saveSync();
    // project.emit();
    project.saveSync();
    project.emit();
    console.log('Project saved');
  });
  doAssert(projectPath);
});
const codeFixCreateVariable = {
  name: 'create variable',
  config: { variableType: 'const' },
  predicate: (diag: Diagnostic, child:Node):boolean => diag.getCode() === 2304 && // Cannot find name 'i'
    child.getKind() === ts.SyntaxKind.Identifier &&
    child.getParent().getKind() === ts.SyntaxKind.BinaryExpression &&
    child.getParent().getParent().getKind() === ts.SyntaxKind.ExpressionStatement,
  description: (diag: Diagnostic, child: Node) : string => `Create variable "${child.getText()}"`,
  // apply: (diag: Diagnostic, child: Node)=>{child.getSourceFile().insertText(child.getStart(false), 'const ')}
  apply: (diag: Diagnostic, child: Node) => {
    child.getSourceFile().insertText(child.getStart(false), 'const '); 
    // child.getSourceFile().insertText(child.getStart(), '/* sebababab */');
    // child.getSourceFile().applyTextChanges()
  }
};
const codeFixes = [
  codeFixCreateVariable
];
/** return the first diagnosis */
function getDiagnosticsInCurrentLocation(project, sourceFile, position) {
  const file = typeof sourceFile === 'string' ? project.getSourceFile(sourceFile) : sourceFile;
  return file.getDiagnostics().filter(d => d.getStart() <= position && position <= d.getStart() + d.getLength());
  // d.getSourceFile().getLineNumberFromPos() ===file.getLineNumberFromPos(position))
}

export function findChildContainingPosition(sourceFile: SourceFile, position: number): Node | undefined {
  let found:Node
  function find(node:  Node, stop: ()=>void):void {
    if (position >= node.getStart() && position < node.getEnd()) {
      node.forEachChild(find)
      if(!found){
        found= node
        stop()
      }
    }
  }
  find(sourceFile, ()=>{})
  return found
}
function doAssert(projectPath) {
//   it('interface should contain delegate method signatures', () => {
//     // expect(cat(`${projectPath}/src/index.ts`).toString()).toContain('getCurrentSpeed(): number;')
//   });
//   it(`project should compile OK`, () => {
//     // project.saveSync()
//     // project.emit()
//     // expect(project.getDiagnostics().length).toBe(0)
//     // // console.log(project.getDiagnostics().map(d=>d.getMessageText()).join('\n'))
//   });
}