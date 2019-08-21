import { Project, TypeGuards } from 'ts-morph';

const project = new Project()
const file = project.createSourceFile('f1.ts', 'var a = 1')
var n = file.getDescendants()[2]
if(n && !TypeGuards.isSemicolonToken(n)) {
  var c = n.getKindName()
}