import { CompilerOptions, ts } from 'ts-morph';
import { File } from './file';
import { loadLibrariesFromUrl, someTsLibraryNames1 } from './loadLibrariesFromUrl';
import {printDiagnostics} from 'ts-simple-ast-extra'
// run a ts-morph project without writing to FS (be able to run ts in the browser)
interface Options{
  /** TODO: currently only remote supported - future - at compile time we can embedd all libraries in the bundle */
  mode?: 'remote'|'embed'
  compilerOptions?: CompilerOptions
  tsConfigJson?: File,
  files: File[]
  verifyNoProjectErrors?: boolean
  targetFile: File
  /** where lib.*.d.ts files are available for fetching. nopkg npm cdn like.  */
  tsLibBaseUrl?:string
}

import { Project, FileSystemHost } from "ts-morph";
import { basename } from 'misc-utils-of-mine-generic';
  //TODO:move to extra or the other
export function parseCompilerOptionsFromText(tsConfigData:string, basePath: string){
  let compilerOptions: CompilerOptions|undefined
    const jsConfigJson = ts.parseConfigFileTextToJson(basePath, tsConfigData)
    if(jsConfigJson.error){
      throw 'jsConfigJson.error'
    }
    const tsConfigJson = ts.parseConfigFileTextToJson(basePath, tsConfigData)
  if (tsConfigJson.error) {
    throw 'tsConfigJson.error'
  }
  let r= ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, basePath)
  if (r.errors.length) {
    throw 'r.errors.length'
  }
  compilerOptions = r.options
return compilerOptions
  
}

export async function run(options: Options){
  const knownTypescriptLibsCdn = `${location.href}libs/`
  // TODO: filter libraries from options.compilerOptions.lib
  const responses = await loadLibrariesFromUrl(options.tsLibBaseUrl || knownTypescriptLibsCdn)
  // const libs = responses.map(r=>({url: r.options.url, content: r.data}))
  // console.log(responses.map(r=>r.fileName));
  const tsConfigData = await options.tsConfigJson!.getContent()
  const     tsconfigPath = dirname(options.tsConfigJson!.getFilePath())
  const compilerOptions: CompilerOptions = parseCompilerOptionsFromText(tsConfigData, tsconfigPath)
console.log(compilerOptions);

// // else {
    //   const tsConfigOptionsR = ts.convertCompilerOptionsFromJson(jsConfigJson.config, '.', basename(options.tsConfigJson!.getFilePath()))
    //   if(tsConfigOptionsR && tsConfigOptionsR.errors){
    //     throw  'tsConfigOptionsR.errors'
    //   }
    //   consttsConfigOptions
    // // }


  
const project = new Project({ useVirtualFileSystem: true});
const fs = project.getFileSystem();
console.log(fs.getCurrentDirectory());

for (const r of responses) {
  // const fileText = ...; // get the file text somehow
  console.log(`${r.fileName}`);
  
  fs.writeFileSync(`${r.fileName}`, r.content);
}

// compilerOptions!.lib!.forEach(l=>{ 
  // debugger
  // console.log(`node_modules/typescript/lib/${l}`, responses.find(r=>r.fileName===l)!.content);
  
  // fs.writeFileSync(`node_modules/typescript/lib/${l}`, responses.find(r=>r.fileName.endsWith(l))!.content);
  // console.log('written', `node_modules/typescript/lib/${l}`);
  
// })
const project2 = new Project({ fileSystem: fs, compilerOptions });
// project.com
// onst project = new Project({ fileSystem: fs });
// console.log(project2.getPreEmitDiagnostics().length);

const f = project2.createSourceFile('test.ts', `console.log('aasdasd')`)
console.log(project2.getPreEmitDiagnostics().length);
console.log(project2.getPreEmitDiagnostics().map(d=>d.getMessageText()));

const ev = f!.getEmitOutput().getOutputFiles().map(d=>d.getFilePath())
console.log(ev, 'seba');
const text = f!.getEmitOutput().getOutputFiles().find(f=>f.getFilePath().endsWith('test.js'))!.getText()
console.log(text);

eval(text)
// console.log(project.getPreEmitDiagnostics().map(d=>d.getMessageText()).join(', '));
}

//TODO: to misc
export function dirname(s: string){
  const i = s.lastIndexOf('/')
  return i===-1 ? '.' : s.substring(0, i)
}

// function loadDtsFiles(fs: FileSystemHost) {
//     // Example that loads every single lib file. You most likely don't need all of these.
//     // Please consult your version of the compiler to see what's necessary.
//     // Note: It is best to generate this list of file names at compile time somehow based on the compiler api version
    // used (these are the .d.ts files found in the node_modules/typescript/lib folder).
   
    
// }
// 

// loadDtsFiles(fs);