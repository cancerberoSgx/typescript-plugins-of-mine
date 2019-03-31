import { CompilerOptions } from 'ts-morph'
import { loadLibrariesFromUrl, loadFiles } from './loadFile'
import { Project } from 'ts-morph'
import { getCompilerOptions } from './getCompilerOptions'
import { TsRunOptions, TsRunResult } from './types'
import { emit } from './emit'

/**
 * run a ts-morph project without writing to FS (be able to run ts in the browser)
 *
 * TODO: if in a second run the config is the same, reuse the project, remove all .ts files and add new ones - reuse libs
 */
export async function run(options: TsRunOptions): Promise<TsRunResult> {
  const t0 = Date.now()
  const errors: any[] = []
  const compilerOptions: CompilerOptions | undefined =
    options.tsConfigJson && (await getCompilerOptions(options.tsConfigJson))
  options.debug && console.log('compilerOptions', compilerOptions || undefined)
  const project = options.project || new Project({ useVirtualFileSystem: true, compilerOptions })
  if (!options.dontCleanProject) {
    project.getSourceFiles().forEach(f => f.deleteImmediatelySync()) //TODO: async
  }
  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length ${options.verifyNoProjectErrors &&
      project.getPreEmitDiagnostics().map(d => d.getMessageText())}`
  }
  const fs = project.getFileSystem()
  // HEADS UP we write all the libraries, although we know which the compilerOptions require, they require each other and we dont have  that info- play safe - and write all
  // const knownTypescriptLibsCdn = `${location.href}libs/`
  const knownTypescriptLibsCdn = `libs/`

  if (!options.project) {
    const responses = await loadLibrariesFromUrl(options.tsLibBaseUrl || knownTypescriptLibsCdn)
    for (const r of responses) {
      fs.writeFileSync(`${r.fileName}`, r.content)
    }
  }
  const files = await loadFiles([options.targetFile, ...(options.files || [])])
  files.forEach(file => {
    project.createSourceFile(file.filePath, file.content)
  })
  if (options.verifyNoProjectErrors && project.getPreEmitDiagnostics().length) {
    throw `options.verifyNoProjectErrors&& project.getPreEmitDiagnostics().length 2222 ` +
      options.verifyNoProjectErrors && project.getPreEmitDiagnostics().map(d => d.getMessageText())
  }
  var { code, targetExport } = await emit(project, options, errors)
  return { emitted: code, errors, totalTime: Date.now() - t0, project, exported: targetExport }
}
