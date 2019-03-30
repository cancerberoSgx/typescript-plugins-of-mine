import { CompilerOptions } from 'ts-morph'
import { loadLibrariesFromUrl } from './loadLibrariesFromUrl'
import { Project } from 'ts-morph'
import { getCompilerOptions } from './getCompilerOptions'
import { withoutExtension } from 'misc-utils-of-mine-generic'
import { TsRunOptions, TsRunResult } from './types'
import { File } from './file'
import PQueue from 'p-queue'
import { ModuleKind, ModuleResolutionKind } from 'typescript'
import { almondMin } from './almondMin'

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

async function emit(project: Project, options: TsRunOptions, errors: any[]) {
  // Heads up : we configure the project to emit AMD module in a single outFile so we can evaluate it
  project.compilerOptions.set({
    ...project.compilerOptions.get(),
    module: ModuleKind.AMD,
    moduleResolution: ModuleResolutionKind.Classic,
    sourceMap: false,
    outFile: './out.js'
  })
  const compilerOptionsOriginal = project.compilerOptions.get()

  project.emit()
  const emittedFiles = project.emitToMemory().getFiles()
  const outputFile = emittedFiles.find(f => f.filePath.endsWith('out.js')) || emittedFiles[0]
  if (!outputFile) {
    throw `!outputFile in emittedFiles`
  }
  const targetName = withoutExtension(options.targetFile.getFilePath())
  const code = `
${almondMin}
${outputFile.text}
new Promise(resolve=>{
  require(['${targetName}'], function(target) {
    resolve(target)
  })
})
  `
  let result: any
  let exported: any
  try {
    result = eval(code)
    exported = await result
  } catch (error) {
    errors.push(error)
  }
  project.compilerOptions.set({ ...compilerOptionsOriginal, outFile: undefined })
  return { result, code, targetExport: exported }
}

export async function loadFiles(files: File[]) {
  const queue = new PQueue({ concurrency: 3 })
  const responses = await queue.addAll(files.map(f => () => f.getContent()))
  return responses.map((r, i) => ({ filePath: files[i].getFilePath(), content: r }))
}
