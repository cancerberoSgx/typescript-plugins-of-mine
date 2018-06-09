# typescript-plugin-proactive-code-fixes

TypeScript Langauge Service Plugin with several small proactive code refactors to solve errors (diagnostics) like creating constructor when a non existent one is invoked, declaring a variable or class when non existent one is defined, reassigning a const, etc. The tool is based both on the context of the user and on the current diagnostic error in that line. Right now: 

 * declare variable on the fly (when assigning non declared variable)
 * declare a new constructor when calling `new A(a,b)` on a class that doesn't have it
 * declare an interface from return values (so you can prototype interfaces when writing implementation faster)
 * change const to let when reassigning a const variable
 * declare a new class or interface when trying to extend or implement something that doesn't exist
 * name unnamed function declarations
 * make an object literal implement an interface by adding / removing necessary members
 * declare member - complements the code fix already existing in typescript to fullfill all cases. declaring missing properties / methods 
 * add missing return statement
 * variable rename when duplicate names exists in the same code block
 * split variable declaration list in individual variable statements. 
 * to named parameters - select a fragment of a parameter declaration list and it will offer to declare all parameters in an interface and use them as an object literal - see: https://github.com/Microsoft/TypeScript/issues/23552


and more to come!!


# Demos

## Declare variables and constructors on the fly 

 * Visual Studio Code Editor
 
![vscode demo creating variables and constructors declarations vscode ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/vscode.gif?raw=true?p=.gif)
 
 * Atom Editor:
 
![vscode demo creating variables and constructors declarations atom](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/atom.gif?raw=true?p=.gif) 

## Declare interfaces from return values

 * Visual Sturio Code Editor:

![Declare interfaces from return values - Visual Sturio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/declareReturnTypeVsCode.gif?raw=true?p=.gif) 

 * Atom Editor:

![Declare interfaces from return values - Atom Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/declareReturnTypeAtom.gif?raw=true?p=.gif) 


# How to use: 
```sh
npm i --save-dev typescript-plugin-proactive-code-fixes
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    "plugins": [{
        "name": "typescript-plugin-proactive-code-fixes"
    }]
  }
}
```

Make sure you have installed typescript in your project (`npm i --save-dev typescript`) the editor you are using uses that typescript and not another. For example, Visual Studio Code comes with its own typescript version, so I need to "Select TypeScript Version" of the workspace: 
```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

# TODO

 * create a json file {production: false}. npm prepare script will change it to {production: true}. index.ts will import it and it will log and load utility plugins only if production === false so its faster on production and we can log a lot stuff and heavy utilities while development
 * config - fixes have great ideas for config but is not currently working.
 * programmatical API
 * unit test for all!
 * generate tsdocs because all fixes are very well documented / roadmap. 
 * Performance - getAppRefactors is taking almost  sec. Make a generic predicate with cache (get which diags are in current position and cache it - make a generic predicate since almost all use the same thing)
 * apply all quick fixes in this file ! define a mechanism of priorities when two or more fixes attach the same position.
 * perhaps we could just recreate the simple-ast sourcefile instead of the whole project 
 * use getcodefixes instead of refactors - blocked - done but no way of defining expensive fixes
 * make sure for each if error is selected in problems view then that selection will suggest the fix
 * new member declarations should add jsdoc
 * declare return type very buggy
