import { Project } from 'ts-morph'
import { moveDeclaration } from '../../src'

const p = new Project({
  tsConfigFilePath: '/home/sg/git/typescript-plugins-of-mine/ts-run/tsconfig.json',
  addFilesFromTsConfig: true
})
const file = p.getSourceFileOrThrow('file.ts')
const declaration = file.getInterfaceOrThrow('File')
const target = p.getSourceFileOrThrow('types.ts')
console.log(p.getSourceFiles().length, target.getFilePath(), declaration.getText())

moveDeclaration({
  target,
  declaration
})

p.saveSync()
