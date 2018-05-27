import Project from 'ts-simple-ast'
  const project = new Project()
  const sourceFile = project.createSourceFile('created.ts', `
function nonIndented(){
}
  function indentedF(){
  
  }
`)
sourceFile.getFunction('nonIndented').addStatements('return null;')
console.log(sourceFile.getText())


sourceFile.getFunction('indentedF').addStatements('return null;')
console.log(sourceFile.getText())