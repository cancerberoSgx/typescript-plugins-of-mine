import { create } from '../src'
import { sync as glob } from 'glob'
import * as ts from 'typescript'

describe('compileSource, findChildren and getJsDoc', () => {
  it('1', () => {
    const inputFiles = glob('src/**/*.ts')
    const tool = create({ 
      rootFileNames: glob('assets/sampleProject1/src/**/.ts'), 
      options: { module: ts.ModuleKind.CommonJS }, 
      currentDirectory: 'assets/sampleProject1/' 
    })
  })
})



// // Start the watcher import {sync as glob} from 'glob' const inputFiles = glob('src/**/*.ts')

// console.log(inputFiles) watch(inputFiles, { module: ts.ModuleKind.CommonJS });