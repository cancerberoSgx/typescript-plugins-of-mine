import { create } from '../src'
import { sync as glob } from 'glob'
import * as ts from 'typescript'

// const inputFiles = glob('src/**/*.ts')
const inputFiles = glob('assets/sampleProject1/src/**/*.ts')
console.log(inputFiles);

const tool = create({ 
  inputFiles,
  options: { module: ts.ModuleKind.CommonJS }, 
  // currentDirectory: 'assets/sampleProject1/' 
})
tool.watch()