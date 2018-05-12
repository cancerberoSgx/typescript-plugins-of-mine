Experiments with typescript compiler API, and Language Service plugins.

## List of work produced: 

### TypeScript LanguageService Plugin Tutorial

The result of my first steps dealing with TypeScript Language Service. I was so happy with my first plugin (useless) that I write a tutorial : 

 * **[Tutorial with code](https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/)**
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)


### typescript-plugin-extract-interface

 * While inside a class, when you select something it activates and suggest "Extract interface". It generates the interface right after the class declaration. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)
 * See it in Action: 
 * ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-interface/doc-assets/extract-interface.gif?raw=true?p=.gif)


### typescript-plugin-subclasses

**WIP**

 * user has to select (part of) the name of class of interface for refactor to be suggested
 * prints the output at the end of current file with links to the exact position (ctrl-click will take you there)
 * See it in action: 
 * ![subclasses-of screencast WIP](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-subclasses-of/doc-assets/screencast.gif?raw=true?p=.gif)

### typescript-plugin-ast-util

 * Tools useful for TypeScript Language Service Plugin developers, see demo and description at [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-ast-util), currently printing AST of selection and printing class/ interface hierarchy. 

### typescript-plugin-add-type

 * if current selection is a declaration without an explicit type, this plugin will suggest you to automatically add the type inferred by the compiler. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/s)

### utility projects

While developing these I realized There was too much repeated code so I ended up writing some utilities project: 

 * [typescript-ast-util](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-ast-util)
 * [typescript-plugin-util](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-util)


## About this project

 * very new, just a research
 * I didn't found refactor plugins like move method, move class, extract interface, method delegate. etc. Search a lot didn't found anythign and that's strange
 In a couple of days I was about to grasp Typescript Language Service architecture, but is poorly documented and there are very few examples. That's the main motivation for this project, try to unite examples, and describe how to implement these plugins

 * This project is a monorepo made with http://rushjs.io/
 hierarchy

## useful links

 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin
 * https://github.com/Microsoft/TypeScript/tree/master/src/services/codefixes
 * 


### other related tools 

 * https://dsherret.github.io/ts-simple-ast/  <<--- this looks good for refactoring
 * https://github.com/wessberg/TypescriptASTUtil
 * https://github.com/wessberg/CodeAnalyzer

 
## Some helpful notes

 * edit SourceFile and worth with TextChangeRange: spec/updateSourceFileSpec.ts
 * get infered types for variables without type: /home/sg/git/typescript-plugins-of-mine/typescript-ast-util/spec/inferTypeSpec.ts
 * know the type by the jsdoc comment or inferring: (let constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);)
 * how to know which modifiers a node has ( return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 || (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);)
 * for getting where a method or a class ir used we could use this: 
  info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange)).map(s=>s.references)
* for debugging and seeing messages from plugin in tsserver exec: 
 export TSS_LOG="-logToFile true -file `pwd`/tsserver_log.log -level verbose"


## projects most of them plugins

Would be good to have a gallery to share knowledge!

 * https://github.com/angular/angular/blob/master/packages/language-service/src/
 * https://github.com/Microsoft/typescript-template-language-service-decorator Framework for decorating a TypeScript language service with additional support for languages embedded inside of template strings  and some that uses it https://github.com/Microsoft/typescript-styled-plugin
 * https://github.com/Microsoft/typescript-lit-html-plugin
 * https://github.com/kasperisager/typecomp  A multi project TypeScript language service abstraction
 * https://github.com/timothykang/css-module-types TypeScript Language Service Plugin for CSS modules.
 * https://github.com/wessberg/TypescriptLanguageService  A host-implementation of Typescripts LanguageService.
 * https://github.com/spion/typescript-workspace-plugin Simple plugin that adds support for yarn-like workspaces to typescript
 * https://github.com/wix/stylable-intelligence
 * https://github.com/knisterpeter/typescript-patternplate-resolver  TypeScript server plugin to inject pattern resolution algorithm in the language service
 * https://github.com/angelozerr/tsserver-plugins Load TypeScript 2.3.x tsserver plugins with TypeScript < 2.3.x
 * https://github.com/RyanCavanaugh/sample-ts-plugin2#readme External Files Walkthrough

 https://github.com/vuejs/vetur Vue tooling for VS Code.
 https://github.com/Microsoft/vscode-tslint

 # artivles
* formatting example: http://blog.ctaggart.com/2015/01/format-typescript-with-v14-language.html
http://blog.ctaggart.com/2015/01/format-typescript-with-v14-language.html
https://github.com/ctaggart/TsAst  create ast from node
https://github.com/nwolverson/tstooltip <-- typescrip tin the browser?
typescript jsdoc jquery  ajax http://blog.ctaggart.com/2016/12/typescript-testing-of-jquery-ajax-from.html}
http://blog.scottlogic.com/2017/05/02/typescript-compiler-api-revisited.html
https://github.com/nwolverson/blog-typescript-api/tree/master/src

 * http://blog.scottlogic.com/2015/01/20/typescript-compiler-api.html

https://github.com/Microsoft/vscode/tree/master/extensions/typescript-language-features/src- client side of vscode that talks with tsserver (plugins)