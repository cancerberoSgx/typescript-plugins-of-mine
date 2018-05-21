import * as shell from 'shelljs'
import Project, {SourceFile, Node, Diagnostic} from 'ts-simple-ast'
import   {addTextToSourceFile} from 'typescript-ast-util'
import * as ts from 'typescript'
import { codeFixes } from '../src/codeFixes';

describe('method delegate interface', () => {
  let project2: Project, program: ts.Program
  const projectPath = `assets/sampleProject1_1_copy`;
  it(`interfaces`, () => {
    shell.rm(`-rf`, projectPath);
    shell.cp(`-r`, `assets/sampleProject1`, `${projectPath}`);
    project2 = new Project({
      tsConfigFilePath: `${projectPath}/tsconfig.json`
    });
    program = project2.getProgram().compilerObject
  });

  it('Declare variable fix ', ()=>{
    const sourceFile = project2.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
    const cursorPosition = 61
    const dignostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    if (!dignostics || !dignostics.length) {
      return fail();
    }
    const diag = dignostics[0];
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const fixes = codeFixes.filter(fix => fix.predicate(diag, child.compilerNode));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(diag, child);
    project2.saveSync();
    project2.emit();
    console.log('Project saved');
  })

  it('Declare constructor fix ', ()=>{
    const sourceFile = project2.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
    const cursorPosition = 61
    const dignostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    if (!dignostics || !dignostics.length) {
      return fail();
    }
    const diag = dignostics[0];
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const fixes = codeFixes.filter(fix => fix.predicate(diag, child.compilerNode));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(diag, child);
    project2.saveSync();
    project2.emit();
    console.log('Project saved');
  })
  doAssert(projectPath);
});


/** return the first diagnosis */
function getDiagnosticsInCurrentLocation(program: ts.Program, sourceFile: ts.SourceFile, position: number) : ts.Diagnostic[]{
  const file = typeof sourceFile === 'string' ? program.getSourceFile(sourceFile) : sourceFile;
  const diagnostics =   [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getDeclarationDiagnostics()
  ];
    return diagnostics.filter(d => d.start <= position && position <= d.start + d.length);
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