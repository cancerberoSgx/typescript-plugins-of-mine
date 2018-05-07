// the answer is NO

import { compileSource, getKindName } from "../src";

const code1 = `
import * as shell from  'shelljs'
export function compileSource(sourceCode: string, tsconfigPath: string = join(__dirname, 'assets', 'simpletsconfig.json')): ts.Program {
  const fileName = 'tmpFile_'+Date.now()+'.ts'
  shell.echo(sourceCode).to(shell.tempdir()+'/'+fileName)
  return compileFile(fileName, tsconfigPath)
}
`

const {project, fileName, tsconfigPath} = compileSource(code1)
const sourceFile = project.getSourceFile(fileName)
if(sourceFile){
  sourceFile.forEachChild(node=>console.log(getKindName(node.kind)))
}