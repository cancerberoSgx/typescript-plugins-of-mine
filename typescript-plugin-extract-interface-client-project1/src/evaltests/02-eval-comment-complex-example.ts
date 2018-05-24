// In this example we have two comments that will be evaluated. Select something in the following function
// declaraion and apply refactor "Eval code in comments". You will see that both comments are evaluated
// showing different information about the selected node


function f( a: {done: (y: number)=>void}): void {
  const evalvar2  = 123
}


/***@ 
c.print(`
Selected node by user is the ${c.node.getKindName()} "${c.node.getText()}" and its parent's 
text is the ${c.node.getParent().getKindName()}  "${c.node.getParent().getText()}"

The AST structure of this file:  
${c.util.printAst(c.node.getSourceFile())}
`)
@***/


/***@ 
let i = 0
c.print(`
Selected node is the ${c.node.getKindName()} "${c.node.getText()}"
Its Ascendants nodes are: 
${(
  [c.node].concat(c.node.getAncestors()))
    .map(a=>a.getKindName() + ' - text: '+a.getText().replace(/\s+/mg, ' ')
      .substring(0, Math.min(a.getText().length, 50) ))
  .reverse().map(a=>' '.repeat(i++)+a).join('\n')
}
`)
@***/

