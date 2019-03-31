import { Project } from 'ts-morph'
import { withoutExtension } from 'misc-utils-of-mine-generic'
import { TsRunOptions } from './types'
import { ModuleKind, ModuleResolutionKind } from 'typescript'
import { almondMin } from './almondMin'
export async function emit(project: Project, options: TsRunOptions, errors: any[]) {
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
