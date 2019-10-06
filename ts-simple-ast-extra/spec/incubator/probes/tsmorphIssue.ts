import { Project, TypeGuards } from 'ts-morph'

// const project = new Project()
// const file = project.createSourceFile('f1.ts', 'var a = 1')
// var n = file.getDescendants()[2]
// if (n && !TypeGuards.isSemicolonToken(n)) {
//   var c = n.getKindName()
// }


// p.declaration.getType().getSymbol() -- often returns undefined - it should be in the types.


// getStaticMethods, getStaticProperties, getInstanceMethods, getConstructors() they all support  getJsDocs() but getInstanceProperties() don't and it should



// const project = new Project()
// const file = project.createSourceFile('f1.ts', 'f(()=>a())')
// file.getDescendantStatements().forEach(s=>console.log(s.getText()))