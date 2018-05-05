import { dumpAst, compileFile, compileProject } from './ts-util';
import { ok, equal, } from 'assert';
import { resolve, join } from 'path';
import ts from 'typescript';


function try1(){
  const rootFile = 'issue1.ts';
  const projectPath = './tests/assets/tsissue1/'
  const program = compileProject(projectPath, [join(projectPath, rootFile)])

  // ts.createlanguage
  // ts.createLanguageService(program.ho)
}


export function refactorTry1Test(){
  try1()
}