
import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext
// You can also evaluate selected code. If you declare the "const c: EvalContext" as above you can have
// typechecking ! Nevertheless, if you want to test something regarding the user's cursor position or
// selection you won't be able to do it this way ... nevertheless you could still copy&paste
// and use "eval code in comments" comments as shown in previous "tutorials" 01 and 02


//  We will evaluate the following code. Make sure is valid JavaScript! Try selecting it and apply the
//  refactor suggestion "eval selection". 
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