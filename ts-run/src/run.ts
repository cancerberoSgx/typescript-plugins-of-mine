import { CompilerOptions } from 'ts-morph';
import { loadLibrariesFromUrl } from './loadLibrariesFromUrl';
import { Project } from "ts-morph";
import { getCompilerOptions } from './getCompilerOptions';
import { withoutExtension } from 'misc-utils-of-mine-generic';
import { TsRunOptions, TsRunResult } from './types';
/**
 * run a ts-morph project without writing to FS (be able to run ts in the browser)
 */
export async function run(options: TsRunOptions): Promise<TsRunResult> {
  const knownTypescriptLibsCdn = `${location.href}libs/`;
  const responses = await loadLibrariesFromUrl(options.tsLibBaseUrl || knownTypescriptLibsCdn);
  const compilerOptions: CompilerOptions = await getCompilerOptions(options.tsConfigJson!);
  const project = new Project({ useVirtualFileSystem: true, compilerOptions });
  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length ` + options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText());
  }
  const fs = project.getFileSystem();
  // HEADS UPwe write all the libraries, alough we know which the compilerOptions require, they require each other and we dont have  that info- play safe - and write all
  for (const r of responses) {
    fs.writeFileSync(`${r.fileName}`, r.content);
  }
  const f = project.createSourceFile(options.targetFile.getFilePath(), await options.targetFile.getContent());
  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length 2222 ` + options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText());
  }
  const emitted = f!.getEmitOutput().getOutputFiles().find(f => f.getFilePath().endsWith(`${withoutExtension(options.targetFile.getFilePath())}.js`));
  if (!emitted) {
    throw '!emitted';
  }
  const text = emitted!.getText();
  const result = eval(text);
  return { result, emitted: text, errors: [] };
}
