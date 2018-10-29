// not an issue - just use getFullStart, getFullWidth, etc

import Project, { TypeGuards } from 'ts-simple-ast';

const project1 = new Project({
  useVirtualFileSystem: true
})
const sourceFile = project1.createSourceFile('src/index.ts', `
class A{

}

`)
const decl =  sourceFile.getClass('A')
const constr1 = decl.addConstructor({
  parameters: [{name: 'foo', type: 'number'}]
})

const construcText = sourceFile.getText().substring(constr1.getFullStart(), constr1.getEnd())
console.log(construcText);
console.log(constr1.getText());

// console.log(sourceFile.getText().length);

// class A{
//   constructor(foo: number) {
//   }
// }
