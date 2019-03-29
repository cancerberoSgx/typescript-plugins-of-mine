import { CompilerOptions } from 'ts-morph';
import { loadLibrariesFromUrl } from './loadLibrariesFromUrl';
import { Project } from "ts-morph";
import { getCompilerOptions } from './getCompilerOptions';
import { withoutExtension } from 'misc-utils-of-mine-generic';
import { TsRunOptions, TsRunResult } from './types';
import {File} from './file'
import PQueue from 'p-queue';
import { notUndefined } from 'misc-utils-of-mine-typescript';
import { ModuleKind, ModuleResolutionKind } from 'typescript';
import { almondMin } from './almondMin';
/**
 * run a ts-morph project without writing to FS (be able to run ts in the browser)
 * 
 * TODO: if in a second run the config is the same, reuse the project, remove all .ts files and add new ones - reuse libs
 */
export async function run(options: TsRunOptions): Promise<TsRunResult> {
  const t0 = Date.now()
  const knownTypescriptLibsCdn = `${location.href}libs/`;
  const responses = await loadLibrariesFromUrl(options.tsLibBaseUrl || knownTypescriptLibsCdn);
  const compilerOptions: CompilerOptions|undefined = options.tsConfigJson && await getCompilerOptions(options.tsConfigJson);
  console.log('compilerOptions', compilerOptions||undefined);
  
  const project = options.project||new Project({ useVirtualFileSystem: true, compilerOptions });

  if(!options.dontCleanProject) {
    project.getSourceFiles().forEach(f=>f.deleteImmediatelySync()) //TODO: async
  }

  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length ` + options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText());
  }
  const fs = project.getFileSystem();
  // HEADS UPwe write all the libraries, alough we know which the compilerOptions require, they require each other and we dont have  that info- play safe - and write all
  for (const r of responses) {
    fs.writeFileSync(`${r.fileName}`, r.content);
  }
  const files = await loadFiles(options.files)

  files.forEach(file=>{
    //TODO: should we fs.writeFileSync or project.createSourceFile ?
    // fs.writeFileSync(`${file.filePath}`, file.content);
     project.createSourceFile(file.filePath,file.content);
    // console.log('project.createSourceFile', file.filePath, file.content, f.getFilePath(), f.getText());
  })
 project.createSourceFile(options.targetFile.getFilePath(), await options.targetFile.getContent());
  // console.log('project.createSourceFile',f.getFilePath(), f.getText());

  // fs.writeFileSync(options.targetFile.getFilePath(),  await options.targetFile.getContent());
// const f = project.getSourceFiles().map(f=>f.getFilePath())
// console.log( project.getSourceFiles().map(f=>f.getFilePath()), project.compilerOptions);


if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
  throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length 2222 ` + options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText());
}
// const emittedFiles = project.emitToMemory().getFiles()
// console.log(emittedFiles.map(f=>({filePath:f.filePath, content: f.text})))

// Heads up : we configure the project to emit AMD module in a single outFile so we can evaluate it
project.compilerOptions.set({
  'module': ModuleKind.AMD, 
  moduleResolution: ModuleResolutionKind.Classic, 
  sourceMap: false,
  outFile: './out.js'
})
  
  project.emit()

//  const emittedFiles  = project.getSourceFiles().map(f=>f.getEmitOutput().getOutputFiles().find(f=>f.getFilePath().endsWith('.js'))).filter(notUndefined)
const emittedFiles =  project.emitToMemory().getFiles()
const outputFile = emittedFiles.find(f=>f.filePath.endsWith('out.js'))||emittedFiles[0]
if(!outputFile){
  throw `!outputFile in emittedFiles`
}

const targetName = withoutExtension(options.targetFile.getFilePath())

 const code = `
//  (function(){
${almondMin}
${outputFile.text}
require(['${targetName}'], function(targetName){
  // debugger
})
// })()
 `
  // console.log(emittedFiles.map(f=>f.getText()).join('\n') )

  // const emitted = emittedFiles.find(f => f.getFilePath().endsWith(`${withoutExtension(options.targetFile.getFilePath())}.js`)) || emittedFiles[0]
  // debugger
  // if (!emitted) {
  //   throw '!emitted';
  // }
  // const text = emitted!.getText();
  let result: any, evalError: any
  try {
    result = eval(code);
  } catch (error) {
    evalError = error
  }
  debugger
  return { result, emitted: code, errors: [], totalTime:Date.now()-t0, project };
}

export async function loadFiles(files:File[]){
  const queue = new PQueue({ concurrency: 3 });
  const responses = await queue.addAll(files.map(f=>()=>f.getContent()))
  return responses.map((r,i)=>( {filePath: files[i].getFilePath(), content: r}))
}

