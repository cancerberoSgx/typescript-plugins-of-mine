import ts from 'typescript';
import { readFileSync } from 'fs';

export function parse(sourcefile: string): ts.SourceFile | undefined {
  const tsConfigJson = ts.parseConfigFileTextToJson('./tsconfig.json', readFileSync('./tsconfig.json').toString())
  if(tsConfigJson.error){
    throw tsConfigJson.error
  }
  let {options, errors} = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, '.')
  if(errors.length){
    throw errors
  }
  const compilerHost:ts.CompilerHost = {
    ...ts.createCompilerHost(options), 
    getSourceFile: (fileName, languageVersion)=>ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true)
  }
  const program = ts.createProgram([sourcefile], options, compilerHost)

  console.log(program.getSourceFiles().map(f=>f.fileName).join('\n'))

  return program.getSourceFile(sourcefile);
}

function visitNotWorking(node:ts.Node, visitor: (node:ts.Node)=>void) {
  if(!node){
    return;
  }
  visitor(node);
  // const children = node.getChildren();
  // if(!children){
  //   return;
  // }
  // children.forEach(child=>visitNotWorking(child, visitor));
  // if instead of using getChild() I try to use getChildCount getChildAt the same error happens: 
  for (let i = 0; i < node.getChildCount() ; i++) { 
    const child = node.getChildAt((i))
    visitNotWorking(child, visitor)   
  }
  
}

function visitWorking(node:ts.Node, visitor: (node:ts.Node)=>void) {
  if(!node){
    return;
  }
  visitor(node);
  node.forEachChild(child=>visitWorking(child, visitor)); // using node.forEachChild works OK.
}


const ast = parse('./file1.ts')
if(ast){
  // visitWorking(ast, (node:ts.Node)=>console.log(node.kind));
  // console.log('Now visit Not working will fail when trying to extract childrens of the class: ');
  visitNotWorking(ast, (node:ts.Node)=>console.log(node.kind));
}
