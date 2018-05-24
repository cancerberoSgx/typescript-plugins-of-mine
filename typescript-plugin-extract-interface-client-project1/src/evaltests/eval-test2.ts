/***@ 

let i = 0
c.print(`
Selected node's is the ${c.node.getKindName()} "${c.node.getText()}"

Its Ascendants nodes are: 

${([c.node].concat(c.node.getAncestors())).map(a=>a.getKindName() + ' - text: '+a.getText().replace(/\s+/mg, ' ').substring(0, Math.min(a.getText().length, 50) )).reverse().map(a=>' '.repeat(i++)+a).join('\n')}
`)
@***/

function f( a: {done: (y: number)=>void}): void {
  const evalvar2  = 123
}