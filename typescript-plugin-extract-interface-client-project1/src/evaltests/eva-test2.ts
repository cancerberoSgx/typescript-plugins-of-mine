/***@ 

let i = 0
c.print(`
Selected node's is the ${c.node.getKindName()} "${c.node.getText()}"

Its Ascendants nodes are: 

${c.node.getAncestors().map(a=>a.getKindName() + ' - text: '+a.getText().replace(/\s+/mg, ' ').substring(0, Math.min(a.getText().length, 50) )).reverse().map(a=>' '.repeat(i++)+a).join('\n')}
`)
@***/var __output = `
Output:

Selected node's is the OpenParenToken "("

Its Ascendants nodes are: 

SourceFile - text: function f(){ evalvar2 = 123 }
 FunctionDeclaration - text: function f(){ evalvar2 = 123 }


`

function f(){
  evalvar2  = 123
}