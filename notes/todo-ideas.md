
 
## TODO

Each project has its own TODO but here are some general ones: 

 * currently all refactors need to select a range in order to suggest - they should also be able to suggest witnout selecting anything - jsut the cursor...
  
 * enable strict==true in tsconfig

 * put the ideas below taht makes sense in a pretty table and present to ts vscode teams. 
 
 * typescript-simple-ast performance problems - are there ? test how well simple-ast behaves in langauge service plugins with big projects. see plugin-util/simple-ast-util.ts - build a cache of sourcefiles and a refresh() method

 * Question: Performance and production:  Because of performance, should I pack useful plugins these plugins toughener in a single plugin to redistribute  so e request the AST / lang service minimal ? - regarding this - probably it is better to delegate more responsibility to plugin-util (impls of getapplicationrefactor/editRefactor) and plugins to be more like codefixs in project proactive-code-fixes. o(plugins implementations more desattached to ts api.)

 * build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!  -- tried but failed see project typescript-plugin-test-helper - everything OKK but my custom plugins are not installed. tried a lot. even also with simple-ast.. report issue to ts. 
 * 
 
## plugin ideas - (refactor - code fix)

* https://github.com/Microsoft/TypeScript/labels/Domain%3A%20Refactorings
* a plugin like move-declaration /  move-file  but for commons.js
* a plugin that changes expressions like cond1 && cond2 || !cond3 to its equivalent : (!cond1 || !cond2) && cond3 - useless and hard
* move method to other class (complicated - move interfaces also or classes hierarchy!)
* (done) add explicit type: select an identifier without explicit type - a refactor add its type based on the inferred one. (done)

* (d:l,u:m) return type not compatible with actual hierarchy fix declared return types	"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.", in that error add return undefined statement

* agile dev - codegen - https://github.com/Microsoft/TypeScript/issues/10139
// IDEA ast-inspector enhancement : other action that prints nodeAtCursor.arent.parent.arent to the top so I know where I'm standings

  * (d: l, u: m/h) variable chained replace it ith variable singl edecl  var a, b, b - replaced with var a ;var b; var c

* "get absolute location" for ast-inspector - where-am'i - I want to know the absolute value of something, like a method, or member . for example module m{class A{prop: {name:string,val: {foo:number}}}} - for foo it should prnt something l ike m.A.prop.val.foo  or more friendly, module m, class A , property prop, prop val

  * (d: m, u: m) facilitate handling foo.getSomeCouldBeUndefined().bar() in strict mode . Create local variaable and (localVar1=foo.getSomeCouldBeUndefined()) && localVar.bar() - dont want to use ! or "orThrow" - wen dont want to throw - we want to if() or continue. 

 * autocomplete a function signature choosing randomly variables in current scope (matching by type) -.... crazy

 * Inline local refactoring  https://github.com/Microsoft/TypeScript/issues/18459 <<--- this one perhaps amerits its own project
 * Reorder Parameters Refactoring https://msdn.microsoft.com/en-us/library/5ss5z206.aspx

 * (d: d/h, u: h) change function/method signature from arguments to single object argument: method("a", 1234, true, {s: '1'}) to method({{param1: 'a', param2: 1234, param3: true, param4: {s: '1'}}})  ... .probably would be nice if user can configure the name of parameters (sing text-based-user-interaction) - is this one : https://github.com/Microsoft/TypeScript/issues/23552

 * transform between arrow to funcs related: https://github.com/Microsoft/TypeScript/issues/23299

 * add braces to arrow funcs -related: https://github.com/Microsoft/TypeScript/issues/23299 (others did this)
 
 * easy ideas here : https://marketplace.visualstudio.com/items?itemName=krizzdewizz.refactorix
 
 * good ideas for js : https://github.com/xsburg/vscode-javascript-booster - interesting using babel to parse typescript
 
 * not refactor but interesting enough https://marketplace.visualstudio.com/items?itemName=ipatalas.vscode-postfix-ts

 * (d:low, u: medium)  convert from a&&f() to if(a){f} - we use && when hurry but hard to understand. but could be complex in case of ex1$$ex2&&ex3. If we extend to ore than 2 expressinos (d: medium, u: low)

 * (d:low, u: medium)   wrapp selection with comment for f(a, b/*, c*/)

 * (d:low, u: medium) forgotten this. reasign const variable error - transform it to let

 * https://github.com/Microsoft/TypeScript/issues/20331
 quick fix for " Parameter 'config' of constructor from exported class has or is using private name 'ToolConfig'." - add export to the private decl
 
 * (d:low, u: medium) forgotten this.

 * (d:low, u: low) missing comma like in fun(a b c) - add the commas

 * cool / hard extension: i don't know nothing about an API and I'm trying to call a method or instantiate something like const ps = new tss.server.ProjectService()  then on the call error, infer the types and create the minimal object that will comply w the signature  (no error)
 * // TODO: call(nonexistent) should suggest create it

 * (d:low, u: low) accessing a private member - suggest make it public
 
 * (d:low, u: low) accessing static member - suggest calling statically from a.method() to ClassA.method()

 *  (Difficulty: medium - Usefulness: low) this error happens when you miss an id for very little : Argument of type '{ dignostics: Diagnostic[]; containingTarget: Node; log: (msg: any) => void; }' is not assignable to parameter of type 'PredicateArg'.
  Object literal may only specify known properties, but 'dignostics' does not exist in type 'PredicateArg'. Did you mean to write 'diagnostics'?
	"code": "2345",
 parse it and suggest rename !

* return types - a functon
* (Difficulty: medium - Usefulness: high). (done) in case object dont implement interface correctly  suggest to fix the object to mathch the interface:
	"code": "2322",
	"message": "Type '{ name: string; config: { variableType: string; }; predicate: (arg: PredicateArg) => boolean; des...' is not assignable to type 'CodeFix'.\n  Types of property 'apply' are incompatible.\n    Type '(diag: Diagnostic[], node: Node<Node>, log: any) => void' is not assignable to type '(arg: PredicateArg) => any'.",
 a solutino could be: parsing the mssage and detecting this type "(diag: Diagnostic[], node: Node<Node>, log: any) => void" and replacing it by " (arg: PredicateArg) => any " ? 


* (done) (d:l, u: m/h) adding a extra property to an object that implements an interface throw the foloowing error, we should suggest adding that to interface / class...  Q: what about other objects implementing it in the rest of the project
Type '{ diagnostics: Diagnostic[]; containingTarget: Identifier; log: { (message?: any, ...optionalPara...' is not assignable to type 'PredicateArg'.  Object literal may only specify known properties, and 'program' does not exist in type 'PredicateArg'.

d===l only if we add the new property as any or ugly casting. i think is OK if we give hints, like {..., speed: "aMeasurement FIXME" as any}

 * (difficulty medium, usefulness: high) string-concat replace with string template


* independent extension : copy& paste with imports - organize imports, formatting, and in the right order (pste each decl before dependencies - after dependants) etc


* idea for gui-no-more (text-based-user-interactoin): example for move member . user select a method, a refactor is suggested "cut method foo()". user goes to other file and select a class identifier. a refactor is suggested "paste method foo()". result. method decl is movesd from first class oththe second one (and all its references are updated across the project.)

* (d: l, u: m) variable redefinition - suggest other name and try to apply rename 


* (d:l, u: l) (done ) ts dont like annon functions : `function(){}` as statements. as expressions is ok "return function(){}" but as statements is wrong: "var i = 0; function(){}; " fix it "adding identifier" - put dummy name
	"code": "1003",
  "message": "Identifier expected.",
  

 * (d: l, u: m) (done) declare undeclared variables: const = 4     throw the error :    "code": "1134",   "message": "Variable declaration expected.",  add a dummy variable identifier. 


 * refactor to remove all empty new lines in the selection


 
 
  crate type from return value : two ideas for agile type definition and refactor:
=====================
 * (useful and cheap). Title: declare new type from return value. Imagine you componse this function that returns a rich object: 
function doEval(string, context: EvalContext) {
  const result = eval(string)
  return { result, output: context._printed.join('\n') }
}
that alone wont generate an error but you start calling it "eval result" and referencing in a couple of other places:
 const evalResult = doEval(match[1], context)...
 function prettyPrintEvalResult(evalResult){...
 so you want to create this type, you just put it a name  expliciting the doEval return type: 
 function doEval(string, context: EvalContext): EvalResult {
  const result = eval(string)
  return { result, output: context._printed.join('\n') }
}
and that will generate an error "code": "2304","message": "Cannot find name 'EvalResult'.", a refactor suggestion appear to create the type automatically from treturn type

* extending the previous refactor, call this one "change type from return type" Suppose in the previous example, you are inside the implementation and realise you need to add a coupe of properties (or remove / rename). Just add the properties to the return type (return { result, output: context._printed.join('\n'), extra: {a: 9} }) and since it was previously created from here - the member names will match and a new suggestion can be used to add the new property to the type. (decide if the refactor should change all code (what should we do in referenced files? ) I would do nothing, just in the method/function and let it break

* and more more general thatn these is be able to declare new type from any expression, evan a variable (sometimes you define type not in the impl (return type, but in the caller side))

* dirty js typechecking with property existence: 	"code": "2339", "message": "Property 'compilerNode' does not exist on type 'Node<Node> | Node'.\n  Property 'compilerNode' does not exist on type 'Node'.", correct  dumpAst(node.compilerNode || node) to be dumpAst((node as any).compilerNode || node)

##  other ideas


* go to definition / goto implementation hierarchy
* views that shows the content of large. hierarchynode.d.ts, tsserverlibrary.d.ts, etc a more tree-view like for examine the structure and search
* yeoman generator for ts plugins ? 






## debugging super idea

we are printing nodes in text. idea is, user writes js in editor and we eval() so you can query ast from the text editor

related to text-based user-interaction ? 