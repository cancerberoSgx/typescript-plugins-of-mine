// we will learn how to use the debug-eval-code plugin to evaluate code in the guest editor
// to develop typescript language service plugins faster. The process of writing the code that 
// implements the actual plugin change in the AST is painful, even for the most simple plugin
// (reload tsserver, look at tsserver.log, find and interpret stacktraces)



const var1  = 123

/*** @ 

c.print(`
Selected node by user is the ${c.node.getKindName()} "${c.node.getText()}" and its parent's 
text is the ${c.node.getParent().getKindName()}  "${c.node.getParent().getText()}"

The AST structure of this file:  
${c.printAst(c.node.getSourceFile())}
`)

@ ***/










