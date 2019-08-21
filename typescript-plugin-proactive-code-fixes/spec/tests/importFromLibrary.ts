

import {Project, TypeGuards } from 'ts-morph';

const project1 = new Project({
  useVirtualFileSystem: true
})
const sourceFile = project1.createSourceFile('src/index.ts', `
import {f1} from 'a-library-f1'

`)
const decl =  sourceFile.getImportDeclarations()[0]
const rel =sourceFile .getRelativePathAsModuleSpecifierTo(decl.getModuleSpecifierSourceFile())
console.log(rel);
