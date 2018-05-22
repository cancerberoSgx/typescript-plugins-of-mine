import * as shell from 'shelljs'
import Project, {SourceFile, Node, Diagnostic, TypeGuards} from 'ts-simple-ast'
import * as ts from 'typescript'
import { codeFixes } from '../src/codeFixes';
import {getDiagnosticsInCurrentLocation} from 'typescript-ast-util'

describe('tests', () => {
  let simpleProject: Project, program: ts.Program
  const projectPath = `assets/sampleProject1_1_copy`;
  const log = function(msg){}

  beforeEach(() => {
    shell.rm(`-rf`, projectPath);
    shell.cp(`-r`, `assets/sampleProject1`, `${projectPath}`);
    simpleProject = new Project({
      tsConfigFilePath: `${projectPath}/tsconfig.json`
    });
    program = simpleProject.getProgram().compilerObject
  });

  it('Declare variable fix', ()=>{
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const cursorPosition = 61
    const dignostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    if (!dignostics || !dignostics.length) {
      return fail();
    }
    // const diag = dignostics[0];
    const child = sourceFile.getDescendantAtPos(cursorPosition);
    const fixes = codeFixes.filter(fix => fix.predicate(dignostics, child.compilerNode, log));
    if (!fixes || !fixes.length) {
      return fail();
    }
    fixes[0].apply(dignostics, child, log);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain('const i=f()')
  })


  it('Declare constructor fix when target kind is child.parent.kind === ts.SyntaxKind.NewExpression', ()=>{
    const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
    const fn = sourceFile.getFunction('main');
    const cursorPosition = 137// ts.getPositionOfLineAndCharacter(sourceFile.compilerNode, 15, 13)
    const dignostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
    if (!dignostics || !dignostics.length) {
      return fail('no dignostics found');
    }
    // const diag = dignostics[0];

    const newExprChild = sourceFile.getDescendantsOfKind(ts.SyntaxKind.NewExpression)
    if(!newExprChild||!newExprChild.length){
      return fail('new new expression found')
    }
    // const newExpr = newExprChild[0]
    const child = newExprChild[0]//sourceFile.getDescendantAtPos(cursorPosition);
    if(!TypeGuards.isNewExpression(child)){
      return fail('is not newexpr type guard')
    }
    const fixes = codeFixes.filter(fix => fix.predicate(dignostics, child.compilerNode, log));
    if (!fixes || !fixes.length) {
      return fail('no fixes for knowndiagnostic');
    }
    fixes[0].apply(dignostics, child, log);
    simpleProject.saveSync();
    simpleProject.emit();
    expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain(`class A{
    public constructor(aString: String) {`)
  })


});




  // it('Declare constructor fix when target kind is child.parent.kind === ts.SyntaxKind.VariableDeclarationList', ()=>{
  //   const sourceFile = simpleProject.getSourceFiles().find(sf => sf.getFilePath().includes(`src/index.ts`));
  //   // console.log(sourceFile.compilerNode.getPositionOfLineAndCharacter(15, 13));
  //   const fn = sourceFile.getFunction('main');
  //   const cursorPosition = 162// ts.getPositionOfLineAndCharacter(sourceFile.compilerNode, 15, 13)
  //   const dignostics = getDiagnosticsInCurrentLocation(program, sourceFile.compilerNode, cursorPosition);
  //   if (!dignostics || !dignostics.length) {
  //     return fail('no dignostics found');
  //   }
  //   const diag = dignostics[0];
  //   const child = sourceFile.getDescendantAtPos(cursorPosition);
  //   const fixes = codeFixes.filter(fix => fix.predicate(diag, child.compilerNode));
  //   if (!fixes || !fixes.length) {
  //     return fail('no fixes for knowndiagnostic');
  //   }
  //   fixes[0].apply(diag, child);
  //   simpleProject.saveSync();
  //   simpleProject.emit();
  //   expect(shell.cat(`${projectPath}/src/index.ts`).toString()).toContain(`class A{
  //   public constructor(aString: String) {`)
  // })

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