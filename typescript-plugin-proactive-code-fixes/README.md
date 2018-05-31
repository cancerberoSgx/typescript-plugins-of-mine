# typescript-plugin-proactive-code-fixes

TypeScript Langauge Service Plugin with several small proactive code refactors to solve errors (diagnostics) like creating constructor when a non existent one is invoked, declaring a variable or class when non existent one is defined, reassigning a const, etc. The tool is based both on the context of the user and on the current diagnostic error in that line. Right now: 

* create variable (when assigning non declared variable)
* create constructor (when calling new A(a,b) on a class that doesn't have that constructor )
* const2let
* declare Class or interface 
* name unnamed function declarations
* make an object literal implement an interface by adding / removing necessary members
* declare an interface from a return value
* declare member - complements the code fix already existing in typescript to fullfill all cases. declaring missing properties / methods 
* add missing return statement

and more to come!!


# Demo

 * declaring variables an constructors on the fly (Visual Studio Code Editor) : 
 * ![vscode demo creating variables and constructors declarations vscode ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/vscode.gif?raw=true?p=.gif)
 * Atom Editor:
 * ![vscode demo creating variables and constructors declarations atom](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/atom.gif?raw=true?p=.gif) 

# How to use: 
```sh
npm i --save-dev typescript-plugin-proactive-code-fixes
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-proactive-code-fixes"
    }]
    ...
  }
}
```

Make sure you have installed typescript in your project (`npm i --save-dev typescript`) the editor you are using uses that typescript and not another. For example, Visual Studio Code comes with its own typescript version, so I need to "Select TypeScript Version" of the workspace: 
```json
{
  // Specifies the folder path containing the tsserver and lib*.d.ts files to use.
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

# TODO

 * Performance - getAppRefactors is taking almost  sec. Make a generic predicate with cache (get which diags are in current position and cache it - make a generic predicate since almost all use the same thign)
 * apply all quick fixes in this file ! define a mechanism of priorities when two or more fixes attach the same position.
 * perhaps we could just recreate the simple-ast sourcefile instead of the whole project 
 * use getcodefixes instead of refactors - blocked - done but no way of defining expensive fixes
 * make sure for each if error is selected in problems view then that selection will suggest the fix

# Ideas

(for future proactive plugins)


 * https://github.com/Microsoft/TypeScript/issues/22392
 * https://github.com/Microsoft/TypeScript/issues/23869
 * https://github.com/Microsoft/TypeScript/labels/Domain%3A%20Refactorings 
 * https://github.com/Microsoft/TypeScript/issues/10139
 * getters and setters: from  property - typescript 3.0.0 implemented this...