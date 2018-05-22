
## plugin ideas

* https://github.com/Microsoft/TypeScript/labels/Domain%3A%20Refactorings
* a plugin like move-declaration /  move-file  but for commons.js
* a plugin that changes expressions like cond1 && cond2 || !cond3 to its equivalent : (!cond1 || !cond2) && cond3 - useless and hard
* move method to other class (complicated - move interfaces also or classes hierarchy!)
* move node (class, interf, function to other file) - complication: exported nodes! must change other's imports
* add explicit type: select an identifier without explicit type - a refactor add its type based on the inferred one. 
* when adding an extra parameter to a function call a refactor should allow me to add this new parameter to the function/method declaration automatically
* method delegation to a property member
* show the ast tree (simplified) of current keyword (DONE!)
* show all subclasses of current class/interface - show all implementors off current interface. 
* go to definition / goto implementation hierarchy
* views that shows the content of large. hierarchynode.d.ts, tsserverlibrary.d.ts, etc a more tree-view like for examine the structure and search
* yeoman generator for ts plugins ? 
* return type not compatible with actual hierarchy fix declared return type
* agile dev - codegen - https://github.com/Microsoft/TypeScript/issues/10139
// IDEA ast-inspector enhancement : other action that prints nodeAtCursor.arent.parent.arent to the top so I know where I'm standings
  * string-concat replace with string template
  * variable chained replace it ith variable singl edecl  var a, b, b - replaced with var a ;var b; var c
* "get absolute location" for ast-inspector - where-am'i - I want to know the absolute value of something, like a method, or member . for example module m{class A{prop: {name:string,val: {foo:number}}}} - for foo it should prnt something l ike m.A.prop.val.foo  or more friendly, module m, class A , property prop, prop val
  * facilitate handling foo.getSomeCouldBeUndefined().bar() in strict mode . Create local variaable and (localVar1=foo.getSomeCouldBeUndefined()) && localVar.bar()
 * autocomplete a function signature choosing randomly variables in current scope (matching by type) -.... crazy
 * Inline local refactoring  https://github.com/Microsoft/TypeScript/issues/18459 <<--- this one perhaps amerits its own project
 * Reorder Parameters Refactoring https://msdn.microsoft.com/en-us/library/5ss5z206.aspx
 *  change function/method signature from arguments to single object argument: method("a", 1234, true, {s: '1'}) to method({{param1: 'a', param2: 1234, param3: true, param4: {s: '1'}}})  ... .probably would be nice if user can configure the name of parameters (sing text-based-user-interaction) - is this one : https://github.com/Microsoft/TypeScript/issues/23552
 * transform between arrow to funcs related: https://github.com/Microsoft/TypeScript/issues/23299
 * add braces to arrow funcs -related: https://github.com/Microsoft/TypeScript/issues/23299
 * easy ideas here : https://marketplace.visualstudio.com/items?itemName=krizzdewizz.refactorix
 * good ideas for js : https://github.com/xsburg/vscode-javascript-booster - interesting using babel to parse typescript
 * not refactor but interesting enough https://marketplace.visualstudio.com/items?itemName=ipatalas.vscode-postfix-ts
 * convert from a&&f() to if(a){f} - we use && when hurry but hard to understand
 * wrapp selection with comment for f(a, b/*, c*/)
 * reasign const variable error - transform it to let
 * https://github.com/Microsoft/TypeScript/issues/20331
 quick fix for " Parameter 'config' of constructor from exported class has or is using private name 'ToolConfig'." - add export to the private decl
 * forgotten this.
 * missing comma like in fun(a b c) - add the commas
 * cool / hard extension: i don't know nothing about an API and I'm trying to call a method or instantiate something like const ps = new tss.server.ProjectService()  then on the call error, infer the types and create the minimal object that will comply w the signature  (no error)


Argument of type '{ dignostics: Diagnostic[]; containingTarget: Node; log: (msg: any) => void; }' is not assignable to parameter of type 'PredicateArg'.
  Object literal may only specify known properties, but 'dignostics' does not exist in type 'PredicateArg'. Did you mean to write 'diagnostics'?
{
	"resource": "/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/spec/codeGenSpec.ts",
	"owner": "typescript",
	"code": "2345",
	"severity": 8,
	"message": "Argument of type '{ dignostics: Diagnostic[]; containingTarget: Node; log: (msg: any) => void; }' is not assignable to parameter of type 'PredicateArg'.\n  Object literal may only specify known properties, but 'dignostics' does not exist in type 'PredicateArg'. Did you mean to write 'diagnostics'?",
	"source": "ts",
	"startLineNumber": 30,
	"startColumn": 58,
	"endLineNumber": 30,
	"endColumn": 68
}
HACEME EL REFACTOR!!!!!


* in case object dont implement interface can we fix it automatically ? for example: 
{
	"resource": "/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/src/code-fix/codeFixCreateConstructor.ts",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "Type '{ name: string; config: { variableType: string; }; predicate: (arg: PredicateArg) => boolean; des...' is not assignable to type 'CodeFix'.\n  Types of property 'apply' are incompatible.\n    Type '(diag: Diagnostic[], node: Node<Node>, log: any) => void' is not assignable to type '(arg: PredicateArg) => any'.",
	"source": "ts",
	"startLineNumber": 6,
	"startColumn": 14,
	"endLineNumber": 6,
	"endColumn": 38
}
parsing the mssage and detecting this type "(diag: Diagnostic[], node: Node<Node>, log: any) => void" and replacing it by " (arg: PredicateArg) => any " ? 


*   adding a extra property to an object that implements an interface throw the foloowing error, we should suggest adding that to interface / class...  Q: what about other objects implementing it in the rest of the project
Type '{ diagnostics: Diagnostic[]; containingTarget: Identifier; log: { (message?: any, ...optionalPara...' is not assignable to type 'PredicateArg'.
  Object literal may only specify known properties, and 'program' does not exist in type 'PredicateArg'.



 
## TODO

Each project has its own TODO but here are some general ones: 
  
 * typescript-simple-ast performance problems
 * Performance and production:  Because of performance, should I pack usefll plugins these plugins togheter in a single plugin to redistribute  so e request the AST / lang service minimal ?
  * refactor subclasses-of to use simple-ast helpers for performance. 
  * remove all gif from this readme only put a couple of simple light images - leave gifs in they own readmes
 * build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!
 * test how well simple-ast behaves in langauge service plugins with big projects. see plugin-util/simple-ast-util.ts - build a cache of sourcefiles and a refresh() method
  
