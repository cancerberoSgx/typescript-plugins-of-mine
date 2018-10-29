// not an issue - just use getFullStart, getFullWidth, etc

import Project, { TypeGuards, Identifier } from 'ts-simple-ast';

const project1 = new Project({
  useVirtualFileSystem: true
})
const sourceFile = project1.createSourceFile('src/index.ts', `
class A{

}
new A().foo()

const oo = {
  bar: 1
}
`)
const id = sourceFile.getFirstDescendant(d=>TypeGuards.isIdentifier(d)&&d.getText()==='foo') as Identifier

const decl =  sourceFile.getClass('A')
const constr1 = decl.addConstructor({
  parameters: [{name: 'foo', type: 'number'}]
})

const construcText = sourceFile.getText().substring(constr1.getFullStart(), constr1.getEnd())
console.log(construcText);
console.log(constr1.getText());

const bar = sourceFile.getFirstDescendant(c=>c.getText()==='bar: 1')

console.log(bar.getParent().getKindName());

// class A{
//   constructor(foo: number) {
//   }
// }
