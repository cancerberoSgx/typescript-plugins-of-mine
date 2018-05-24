// we will learn how to use the debug-eval-code plugin to evaluate code in the guest editor
// to develop typescript language service plugins faster. The process of writing the code that 
// implements the actual plugin change in the AST is painful, even for the most simple plugin
// (reload tsserver, look at tsserver.log, find and interpret stacktraces)

// here we will develop a plugin that add "const" keyword when users forgot to declare a 
// variable like the follwing snippet:

var1 = 123

/***@ 

c.print(`
Hello from editor. Using typescript version: ${c.ts.version}

Selected node by user is a ${c.node.getKindName()} and its parent's text is "${c.node.getParent().getText()}"

The AST structure of this file:  
${c.printAst(c.node.getSourceFile())}
`)

@***/