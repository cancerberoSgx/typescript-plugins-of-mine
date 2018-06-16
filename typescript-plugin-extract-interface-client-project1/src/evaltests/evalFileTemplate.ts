// (See ./evalTLSTutorial.ts for information)

// end of sample code - the rest is our "plugin implementation"
import * as ts from 'typescript'
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { TypeGuards, QuoteKind } from 'ts-simple-ast';
declare const c: EvalContext;

// we will be evaluating code inside functions. This first one just prints a message just put the cursor inside the function 
// , save the file, and apply refactor "Evaluate 'test1' function". You should see a new string right after the function test1
// with the message "hello world"
function test1() {
  const msg: string = 'hello earth'
  c.print(msg) 
}

// we can also evaluate a selection, but be aware, unlike  previous example, this must be valid JavaScript (cannot have types).
()=>{
  c.print(c.project.getSourceFiles()
    .find(file => file.getBaseName() === 'evalFileTemplate.ts')
    .getDescendantsOfKind(ts.SyntaxKind.StringLiteral)
    .map(literal => literal.getLiteralText())
    .join(', ')
  )
}


// as you might saw, there is a `c` variable. It is a context object provided from the TypeScript "service" where the
// plugin ast-inspector currently runs. It provides with some useful information like the current document the user is
// standin right now (this one), the cursor position or selection range, and some utility functions (like c.print)

// In the following example we:
//  * create a new TypeScript project 
//  * add a new source file which has the same content as this one
//  * get the Node in which the user currently as the cursor or selection
//  * verify that's a string literal
//  * modify the string changing its quotes
//  * print back the whole file

function test2() {
  // The following statement is a sample AST we will use for testing our plugin
  const firstString = "I'm a literal string and \"you will try to change\" my quotes"

  // we know that in this file, the character 1928 is inside previous string literal. In a real TLS plugin this 
  //  position is provided by the ts server
  const position = 1846
  const thisSourceFile = c.project.getSourceFile(c.fileName)
  const node = thisSourceFile.getDescendantAtPos(position)
  if (!TypeGuards.isStringLiteral(node)) {
    c.print(`Error: ${node.getKindName()} not a string. Aborting`)
    return
  }
  const quote = (s: string, q: string): string => {
    const newLiteral = s.replace(new RegExp(`${q}`, 'gmi'), `\\${q}`)
    return q + newLiteral + q
  }
  const newQuoteChar = node.getQuoteKind() === QuoteKind.Double ? QuoteKind.Single : QuoteKind.Double
  node.replaceWithText(quote(node.getLiteralText(), newQuoteChar))
}
// Now evaluate function test2 just like you did with test1 but this time pay attention on the string "firstString"
// since it will be changed by our "plugin". It's a toggle quote plugin, execute it again to restore the string to previous state. 

// (for the sake of simplicity we use ts-simple-ast because is much simpler to work with but that's totally optional)
// in the following code, `c.project` is a ts-simple-ast project you can access the native TypeScript project like this
// `c.info.project` and the program like this `c.info.languageService.getProgram()`

// let's now throw an error just to see how the stack is printed out ? 
function test3(){
  // as you might saw, the stack is not so useful - but at least we know exceptions are handled and printed out. 
  const fn = ()=>{
    return (()=>{
      throw new Error('just to see')
    })()
  }
  fn()
}
