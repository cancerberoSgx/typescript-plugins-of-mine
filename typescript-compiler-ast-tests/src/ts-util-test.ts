import { dumpAst, compileFile, compileProject } from './ts-util';
import { ok, equal, } from 'assert';
import { resolve, join } from 'path';
import ts from 'typescript';

function compileFileTest() {
  const filePath = './tests/assets/file1.ts'
  const ast = compileFile(filePath).getSourceFile(filePath)
  ok(ast)
  if (ast) {
    const dumped = dumpAst(ast)
    ok(dumped.includes('InterfaceDeclaration'))
    ok(dumped.includes('ClassDeclaration'))
    ok(dumped.includes('HeritageClause'))
  }
}


function compileProjectTest() {
  const rootFile = 'issue1.ts';
  const projectPath = './tests/assets/tsissue1/'
  const program = compileProject(projectPath, [join(projectPath, rootFile)])
  ok(program.getSourceFiles().find(f => f.fileName.includes(rootFile)))
}

export function tsUtilTest(){
  compileFileTest()
  compileProjectTest()
  
}
// ok(false)
// function refactorTry1() {
//   const rootFile = 'issue1.ts';
//   const projectPath = resolve('./tests/assets/tsissue1/')
//   const program = compileProject(projectPath, [join(projectPath, rootFile)])
//   ok(program.getSourceFiles().find(f => f.fileName.includes(rootFile)))
// }
// refactorTry1()