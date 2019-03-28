import { CompilerOptions } from 'ts-morph';
import { File } from './file';
import { loadLibrariesFromUrl } from './loadLibrariesFromUrl';

import { Project, FileSystemHost } from "ts-morph";
import { getCompilerOptions } from './getCompilerOptions';
import { withoutExtension } from 'misc-utils-of-mine-generic';

interface Options {
  /** TODO: currently only remote supported - future - at compile time we can embed all libraries in the bundle */
  mode?: 'remote' | 'embed'
  compilerOptions?: CompilerOptions
  tsConfigJson?: File,
  files: File[]
  verifyNoProjectErrors?: boolean
  targetFile: File
  /** where lib.*.d.ts files are available for fetching. nopkg npm cdn like.  */
  tsLibBaseUrl?: string
}

interface Result<T=any> {
  /** the result of evaluating the emitted output */
  result: T
  errors: any[]
  /** target file emitted text */
  emitted: string
}

/**
 * run a ts-morph project without writing to FS (be able to run ts in the browser)
 */
export async function run(options: Options) : Promise<Result> {
  const knownTypescriptLibsCdn = `${location.href}libs/`
  const responses = await loadLibrariesFromUrl(options.tsLibBaseUrl || knownTypescriptLibsCdn)

  const compilerOptions: CompilerOptions = await getCompilerOptions(options.tsConfigJson!);
  const project = new Project({ useVirtualFileSystem: true, compilerOptions });
  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length ` + options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText())
  }
  const fs = project.getFileSystem();

  // HEADS UPwe write all the libraries, alough we know which the compilerOptions require, they require each other and we dont have  that info- play safe - and write all
  for (const r of responses) {
    fs.writeFileSync(`${r.fileName}`, r.content);
  }
  const f = project.createSourceFile(options.targetFile.getFilePath(), await options.targetFile.getContent())
  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length 2222 ` + options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText())
  }
  const emitted = f!.getEmitOutput().getOutputFiles().find(f => f.getFilePath().endsWith(`${withoutExtension(options.targetFile.getFilePath())}.js`))
  if (!emitted) {
    throw '!emitted'
  }
  const text = emitted!.getText()
  const result = eval(text) 
  return { result , emitted : text, errors: []}
}

//TODO: to misc
export function dirname(s: string) {
  const i = s.lastIndexOf('/')
  return i === -1 ? '.' : s.substring(0, i)
}

// function loadDtsFiles(fs: FileSystemHost) {
//     // Example that loads every single lib file. You most likely don't need all of these.
//     // Please consult your version of the compiler to see what's necessary.
//     // Note: It is best to generate this list of file names at compile time somehow based on the compiler api version
    // used (these are the .d.ts files found in the node_modules/typescript/lib folder).
// }
// 
// loadDtsFiles(fs);

// compilerOptions!.lib!.forEach(l=>{ 
  // debugger
  // console.log(`node_modules/typescript/lib/${l}`, responses.find(r=>r.fileName===l)!.content);

  // fs.writeFileSync(`node_modules/typescript/lib/${l}`, responses.find(r=>r.fileName.endsWith(l))!.content);
  // console.log('written', `node_modules/typescript/lib/${l}`);

// })
// const project2 = new Project({ fileSystem: fs, compilerOptions });
// project.com
// onst project = new Project({ fileSystem: fs });
// console.log(project2.getPreEmitDiagnostics().length);