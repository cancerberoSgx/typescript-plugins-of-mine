
 
## TODO

Each project has its own TODO but here are some general ones: 

 * in the concrete vscode extension, should I update simplesourcefile when buffer change ? https://code.visualstudio.com/docs/extensions/example-language-server#_incremental-text-document-synchronization - probably yes so we dont get nasty error - tsa takes too long...


 * (done) unit tests for all!!!

  
 * enable strict==true in tsconfig



 * put the ideas below taht makes sense in a pretty table and present to ts vscode teams. 
 
 * typescript-simple-ast performance problems - are there ? test how well simple-ast behaves in langauge service plugins with big projects. see plugin-util/simple-ast-util.ts - build a cache of sourcefiles and a refresh() method

 * Question: Performance and production:  Because of performance, should I pack useful plugins these plugins toughener in a single plugin to redistribute  so e request the AST / lang service minimal ? - regarding this - probably it is better to delegate more responsibility to plugin-util (impls of getapplicationrefactor/editRefactor) and plugins to be more like codefixs in project proactive-code-fixes. o(plugins implementations more desattached to ts api.)

 * build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!  -- tried but failed see project typescript-plugin-test-helper - everything OKK but my custom plugins are not installed. tried a lot. even also with simple-ast.. report issue to ts. 
 
 

## plugin ideas - (refactor - code fix)





 * wrap selection with try-catch

 * check this: https://github.com/Microsoft/TypeScript/pull/13940 and if its possible to add custom transforms fromplugins add one that let user embedd raw text from fs at compile time.

 * reorder members alphabetically , by type(constructors first) or by modifiers (public first). Let the user stablish these rules. 


 * babel supports typescript and also has lots of transformation plugins : https://babeljs.io/docs/en/next/plugins - if these work with typescript 

 * (Difficulty: medium - Usefulness: medium-low) add super() call on constructors that lack it

 * (Difficulty: low - Usefulness: medium-low) accessing non public members should suggest changing the member signature / decl to public. 

 * fix return type:
 ```
 function f(): Date {
    return Date.now()
  }
```
should suggest changing fixing the return type and the result of applying it should be : 
```
 function f(): number {
    return Date.now()
  }
```


 * https://github.com/Microsoft/TypeScript/labels/Domain%3A%20Refactorings

 * a plugin like move-declaration /  move-file  but for commons.js

 * a plugin that changes expressions like cond1 && cond2 || !cond3 to its equivalent : (!cond1 || !cond2) && cond3 - useless and hard

 * move method to other class (complicated - move interfaces also or classes hierarchy!)

 * (done) add explicit type: select an identifier without explicit type - a refactor add its type based on the inferred one. (done)

 * (d:l,u:m) (done) return type not compatible with actual hierarchy fix declared return types	"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.", in that error add return undefined statement

 * agile dev - codegen - https://github.com/Microsoft/TypeScript/issues/10139

 * (d: l, u: m/h) variable chained replace it ith variable singl edecl  var a, b, b - replaced with var a ;var b; var c

 * (d: m, u: m) facilitate handling foo.getSomeCouldBeUndefined().bar() in strict mode . Create local variable and (localVar1=foo.getSomeCouldBeUndefined()) && localVar.bar() - dont want to use ! or "orThrow" - when dont want to throw - we want to if() or continue. optional: adding ! could be configurable

 * (done by typescript team) async await - "code": "1308",	"message": "'await' expression is only allowed within an async function.", - on that error - add the missing async keyword to parent signatured node. Enhancement : Fix the return type declared for it 

 * (d: m, u: h) change string literal from " to ' or ` - escaping inner chars that might contain. 
  
 * (d: s, u: h) : wrap word or selection inside a temptae string with ${}


 * Inline lol refactoring  https://github.com/Microsoft/TypeScript/issues/18459 <<--- this one perhaps amerits its own project
 * Reorder Parameters Refactoring https://msdn.microsoft.com/en-us/library/5ss5z206.aspx

 * (d: d/h, u: h) (done) change function/method signature from arguments to single object argument: method("a", 1234, true, {s: '1'}) to method({{param1: 'a', param2: 1234, param3: true, param4: {s: '1'}}})  ... .probably would be nice if user can configure the name of parameters (sing text-based-user-interaction) - is this one : https://github.com/Microsoft/TypeScript/issues/23552

 * transform between arrow to funcs related: https://github.com/Microsoft/TypeScript/issues/23299

 * (d: m, u: high) (done) add braces to arrow funcs aand viceversaa-related: https://github.com/Microsoft/TypeScript/issues/23299 (others did this)
 
 * fix signature of implementation methods and members in general: 	"code": "2416",  "message": "Property 'method1' in type 'A' is not assignable to the same property in base type 'IA'.\n  Type '() => void' is not assignable to type '() => string'.\n    Type 'void' is not assignable to type 'string'.",
 
 * easy ideas here : https://marketplace.visualstudio.com/items?itemName=krizzdewizz.refactorix
 
 * good ideas for js : https://github.com/xsburg/vscode-javascript-booster - interesting using babel to parse typescript
 
 * not refactor but interesting enough https://marketplace.visualstudio.com/items?itemName=ipatalas.vscode-postfix-ts

 * (d:m, u:h) refactor to rename variables to camel, mayus, and underscode style like someColor to some_color and SomeColor and Some_Color, etc

 * (d:low, u: medium)  convert from a&&f() to if(a){f} - we use && when hurry but hard to understand. but could be complex in case of ex1$$ex2&&ex3. If we extend to ore than 2 expressinos (d: medium, u: low)

 * (d:low, u: medium)   wrapp selection with comment for f(a, b/*, c*/)

 * (d:low, u: medium) (typescript already do it)forgotten this. reasign const variable error - transform it to let

 * https://github.com/Microsoft/TypeScript/issues/20331
 quick fix for " Parameter 'config' of constructor from exported class has or is using private name 'ToolConfig'." - add export to the private decl

 * (d:low, u: low) missing comma like in fun(a b c) - add the commas

 * cool / hard extension: i don't know nothing about an API and I'm trying to call a method or instantiate something like const ps = new tss.server.ProjectService()  then on the call error, infer the types and create the minimal object that will comply w the signature  (no error)
 
 * (d: medium, u: medium) (done declareVariable) TODO: call(nonexistent) should suggest create it

 * (d:low, u: low) (done) accessing a private member - suggest make it public
 
 * (d:low, u: low) accessing static member - suggest calling statically from a.method() to ClassA.method()

 *  (Difficulty: medium - Usefulness: low) this error happens when you miss an id for very little : Argument of type '{ dignostics: Diagnostic[]; containingTarget: Node; log: (msg: any) => void; }' is not assignable to parameter of type 'PredicateArg'.
  Object literal may only specify known properties, but 'dignostics' does not exist in type 'PredicateArg'. Did you mean to write 'diagnostics'?
	"code": "2345",
 parse it and suggest rename !

 * (Difficulty: medium - Usefulness: high). (done) in case object dont implement interface correctly  suggest to fix the object to mathch the interface:
	"code": "2322",
	"message": "Type '{ name: string; config: { variableType: string; }; predicate: (arg: PredicateArg) => boolean; des...' is not assignable to type 'CodeFix'.\n  Types of property 'apply' are incompatible.\n    Type '(diag: Diagnostic[], node: Node<Node>, log: any) => void' is not assignable to type '(arg: PredicateArg) => any'.",
 a solutino could be: parsing the mssage and detecting this type "(diag: Diagnostic[], node: Node<Node>, log: any) => void" and replacing it by " (arg: PredicateArg) => any " ? 


 * (done) (d:low, u: m/h) adding a extra property to an object that implements an interface throw the foloowing error, we should suggest adding that to interface / class...  Q: what about other objects implementing it in the rest of the project
Type '{ diagnostics: Diagnostic[]; containingTarget: Identifier; log: { (message?: any, ...optionalPara...' is not assignable to type 'PredicateArg'.  Object literal may only specify known properties, and 'program' does not exist in type 'PredicateArg'.

d===l only if we add the new property as any or ugly casting. i think is OK if we give hints, like {..., speed: "aMeasurement FIXME" as any}

 * generate index.ts with all the exports - have a nice name in ts-simple-ast dont know...
 
 * (difficulty medium, usefulness: high) (done) string-concat replace with string template


 * independent extension : copy& paste with imports - organize imports, formatting, and in the right order (pste each decl before dependencies - after dependants) etc

 * (done) idea for gui-no-more (text-based-user-interactoin): example for move member . user select a method, a refactor is suggested "cut method foo()". user goes to other file and select a class identifier. a refactor is suggested "paste method foo()". result. method decl is movesd from first class oththe second one (and all its references are updated across the project.)

 * (d: l, u: m) (done) variable redefinition - suggest other name and try to apply rename . example: 
let a = 1
//....
let a = 's'//"code": "2451",	"message": "Cannot redeclare block-scoped variable 'a'.",
// ....
function a(){}

 * (d:l, u: l) (done ) ts dont like annon functions : `function(){}` as statements. as expressions is ok "return function(){}" but as statements is wrong: "var i = 0; function(){}; " fix it "adding identifier" - put dummy name
	"code": "1003",
  "message": "Identifier expected.",
  
 * refactor fragment to class method ? (from inside a method body select statements and move them to a new method) is it already supported ? 

 * (d: l, u: m) (done) declare undeclared variables: const = 4     throw the error :    "code": "1134",   "message": "Variable declaration expected.",  add a dummy variable identifier. 

 * (d:s,u:m) (done )refactor to remove all empty new lines in the selection. 

 * more general than previous one (seee its impl) - user defined template-based action to remove or not a line

 * class ReorderParams implements CodeFix {} typescript nor mine proactive is suggesting to implement the interface because has missing method implementations. only for properties it works

 * (d:s,u:s)	"code": "2448",	"message": "Block-scoped variable 'findInterfacesWithPropertyNamed' used before its declaration.",
 
 * if to switch and viceversa.
 
 * (d: m, u: s/m) (done) crate type from return value : two ideas for agile type definition and refactor:

 * (done)  (useful and cheap). Title: declare new type from return value. Imagine you componse this function that returns a rich object: 
 ```
function doEval(string, context: EvalContext) {
  const result = eval(string)
  return { result, output: context._printed.join('\n') }
}
 ```
that alone wont generate an error but you start calling it "eval result" and referencing in a couple of other places:
 ```
 const evalResult = doEval(match[1], context)...
 function prettyPrintEvalResult(evalResult){...
  ```
 so you want to create this type, you just put it a name  expliciting the doEval return type: 

  ```function doEval(string, context: EvalContext): EvalResult {
  const result = eval(string)
  return { result, output: context._printed.join('\n') }
}
 ```
and that will generate an error "code": "2304","message": "Cannot find name 'EvalResult'.", a refactor suggestion appear to create the type automatically from treturn type

 * think on common deprecation API usecase. sht's more common use case ? removing members . changing params and return type (make this cllback based funciton now remoev callback and / or return promise. Examples: 
   * https://github.com/Microsoft/TypeScript/wiki/API-Breaking-Changes
   * https://jquery.com/upgrade-guide/3.0/#summary-of-important-changes

 * extending the previous refactor, call this one "change type from return type" Suppose in the previous example, you are inside the implementation and realise you need to add a coupe of properties (or remove / rename). Just add the properties to the return type (return { result, output: context._printed.join('\n'), extra: {a: 9} }) and since it was previously created from here - the member names will match and a new suggestion can be used to add the new property to the type. (decide if the refactor should change all code (what should we do in referenced files? ) I would do nothing, just in the method/function and let it break

 * (extending prevous) and more more general than these is be able to declare new type from any expression, evan a variable (sometimes you define type not in the impl (return type, but in the caller side))

 * (difficulty: low, usefulness: low) dirty js typechecking with property existence: 	"code": "2339", "message": "Property 'compilerNode' does not exist on type 'Node<Node> | Node'.\n  Property 'compilerNode' does not exist on type 'Node'.", correct  dumpAst(node.compilerNode || node) to be dumpAst((node as any).compilerNode || node)


 * signature refactor : this is very ambitious, but, we can start with small useful things, like property of a param rename or transforming from type T to T[]

 
##  other ideas

### programatically / APIs to load ts plugins : 
  * programatically enable a plugin - it seems is possible from another plugin :     protected enablePlugin(pluginConfigEntry: PluginImport, searchPaths: string[]): void;
            /** Starts a new check for diagnostics. Call this if some file has updated that would cause diagnostics to be changed. */ - this is on Project on tsserverlibrary.ts
and also this one:  protected enableGlobalPlugins(): void;


 * vscode extension that allows me to load typescript plugins installed in current project tsconfig and package.json so I dont have to maintain a vscode pugin for eac o fmy tspugins. I install this tlspluginmaster vscode extension and via settings I choose which plugins are active for which workspace / user, etc - workspaces are responsible of installing the plugins dependencies or user install it globally. TODO: investigate if its possible to add contributions programatically instead vis .package.json.
 ts.server.ProjectService.reloadProjects(): void
This function rebuilds the project for every file opened by the client This does not reload contents of open files from disk. But we could do that if needed
  * load a plugin form unpkg ? 

  * typescript plugin master -that aloww you to control and query which plugins are loaded and load /unload quickly?


 * "get absolute location" for ast-inspector - where-am'i - I want to know the absolute value of something, like a method, or member . for example module m{class A{prop: {name:string,val: {foo:number}}}} - for foo it should prnt something l ike m.A.prop.val.foo  or more friendly, module m, class A , property prop, prop val

 * autocomplete a function signature choosing randomly variables in current scope (matching by type) -.... crazy

 * go to definition / goto implementation hierarchy
 * views that shows the content of large. hierarchynode.d.ts, tsserverlibrary.d.ts, etc a more tree-view like for examine the structure and search
 * yeoman generator for ts plugins ? 

 * at certain point, in a signature helper I would like to be suggested wiht the "closest" values that comply with the current parameter, closest in the sens both in the ASST and in the type 





## debugging super idea

we are printing nodes in text. idea is, user writes js in editor and we eval() so you can query ast from the text editor

related to text-based user-interaction ? 