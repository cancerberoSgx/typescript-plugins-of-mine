
import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

// You can also evaluate selected code. If you declare the "const c: EvalContext" as above you can have
// typechecking ! Nevertheless, if you want to test something regarding the user's cursor position or
// selection you won't be able to do it this way ... nevertheless you could still copy&paste and use "eval
// code in comments" comments as shown in previous "tutorials" 01 and 02

// TIP: use  "noImplicitAny": false, in tsconfig.json because you cannot have types in the code 
// TIP: "SyntaxError: Unexpected token :" si probably because you copy&paste typescript code with a type (:string)

//  We will evaluate the following code. Make sure is valid JavaScript! Try selecting a range that contains it
//  - and only it, and apply the refactor suggestion "eval selection".
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


// there's an easy way and its putting the code inside a function body - then select just a small text inside
// that cuntion and apply refactor "Eval current function selection". And this time YOU CAN USE TypeScript ! Try it :

function scannerExample() {
  const ts = c.ts, getKindName = c.util.getKindName, print = c.print
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true)
  const initializeState = text => {
    scanner.setText(text)
    scanner.setOnError((message, length) => {
      print('Error: ' + message)
    })
    scanner.setScriptTarget(ts.ScriptTarget.ES5)
    scanner.setLanguageVariant(ts.LanguageVariant.Standard)
  }
  initializeState('var foo = 123'.trim())
  var token = scanner.scan()
  while (token != ts.SyntaxKind.EndOfFileToken) {
    print(getKindName(token) + ', token: ' + token)
    token = scanner.scan()
  }
}


