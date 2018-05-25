// internal note: install - vscode. 

// we will learn how to use the debug-eval-code plugin to evaluate code in the guest editor
// to develop TypeScript language service plugins faster which is painful. Even for the most simple plugin it
// implies reload tsserver, look at tsserver.log, find and interpret stacktraces, come back to host editor,
// fix and try again... Would be because of this that there are so few TypeScript plugins? If so, let's hope
// this eval thingy changes that...


// select something like the variable name 'var1' and apply refactor "eval code in comments"
const var1  = 123


// internal note: explain what's happening and show an error