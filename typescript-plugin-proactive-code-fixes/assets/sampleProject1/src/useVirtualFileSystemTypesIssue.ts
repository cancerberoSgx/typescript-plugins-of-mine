import Project, { TypeGuards } from 'ts-simple-ast';

const project1 = new Project({
  useVirtualFileSystem: true
})
const sourceFile = project1.createSourceFile('src/index.ts', `hello([[1,2]])`)
const name1 = sourceFile.getDescendants().find(TypeGuards.isCallExpression).getArguments().map(p => p.getType().getText()).join(', ')
console.log('name1: '+name1 )

const project2 = new Project({})
const sourceFile2 = project2.createSourceFile('src/index2.ts', `hello([[1,2]])`)
const name2 = sourceFile2.getDescendants().find(TypeGuards.isCallExpression).getArguments().map(p => p.getType().getText()).join(', ')
console.log('name2: '+name2 )
