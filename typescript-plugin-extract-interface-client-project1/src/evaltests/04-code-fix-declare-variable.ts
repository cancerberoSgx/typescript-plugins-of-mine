// now let's try to implement a plugin that adds a "name" function declarations without name. This is an error
// in typescript and the plugin will suggest fixing it by just putting a dummy name. The
// following snippet shows that :

function(a: number):[number]{ return [Math.PI*a/2]}


import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext


// the following is the snippets to be evaluated. Again, make sure is valid JavaScript!
let i = 0
const descendants = ([c.node].concat(c.node.getAncestors()))
  .map(a => a.getKindName() + ' - text: ' + a.getText().replace(/\s+/mg, ' ')
    .substring(0, Math.min(a.getText().length, 50)))
  .reverse().map(a => ' '.repeat(i++) + a).join('\n')
c.print(`
Selected node is the ${c.node.getKindName()} "${c.node.getText()}"
Its Ascendants nodes are: 
${descendants}
`)
