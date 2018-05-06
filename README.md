Experiments with typescript compiler API, and Language Service plugins.

Note: this is a monorepo made with http://rushjs.io/


## TypeScript LanguageService Plugin Tutorial

 * **[Tutorial with code](https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/)**
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)
 * See it in Action: ![See it in action](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/sample-ts-plugin1/doc-assets/plugin-screencast.gif?raw=true?t=.gif)

## typescript-plugin-extract-interface

 * **WIP**
 * While inside a class, when you select something it activates and suggest "Extract interface". It generates the interface right after the class declaration. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)
 * See it in Action: ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-interface/doc-assets/extract-interface.gif?raw=true?p=.gif)

## typescript-plugin-print-ast

 * very simple way of inspecting the AST of the node where the cursor is
 * prints a very simplied version of the AST
 * Useful when developing Typescript plugins to understand the AST
 * jsut make a minimal selection and it will suggest "Print AST"
 * AST will be dumped as a template string right after the node (watch out could break your code!)

 TODO: project, readme and screencast

## typescript-plugin-subclasses

 * when inside a class declaration it offers two suggestions : "Show direct subclasses" and "Show all Subclasses"
 * when inside an interface declaration it offers the following suggestions: "Show direct sub-interfaces", "Show All SUb-interfaces" "Show direct implementor classes" "Show all implementor classes"
 * It prints all this information right after the node declaration
 * enhance: we could print this info in a separate file, that implrts everything so user can navigate there. 

 TODO: project, readme and screencast

## plugin ideas

 * extract interface from class
 * move method to other class (complicated - move interfaces also or classes hierarchy!)
 * move node (class, interf, function to other file) - complication: exported nodes! must change other's imports
 * add explicit type: select an identifier without explicit type - a refactor add its type based on the inferred one. x
 * show the ast tree (simplified) of current keyword (DONE!)
 * show all subclasses of current class/interface - show all implementors off current interface. 
 * yeoman generator for ts plugins ? 

## useful links

 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin


### typescript plugins I've found over there:

Would be good to have a gallery to share knowledge!
 * 
 * https://github.com/angular/angular/blob/master/packages/language-service/src/
 * https://github.com/Microsoft/typescript-template-language-service-decorator Framework for decorating a TypeScript language service with additional support for languages embedded inside of template strings  and some that uses it https://github.com/Microsoft/typescript-styled-plugin  https://github.com/Microsoft/typescript-lit-html-plugin
 * https://github.com/kasperisager/typecomp  A multi project TypeScript language service abstraction
 * https://github.com/timothykang/css-module-types TypeScript Language Service Plugin for CSS modules.
 * https://github.com/wessberg/TypescriptLanguageService  A host-implementation of Typescripts LanguageService.
 * https://github.com/spion/typescript-workspace-plugin Simple plugin that adds support for yarn-like workspaces to typescript
 * https://github.com/wix/stylable-intelligence

 * https://github.com/knisterpeter/typescript-patternplate-resolver  TypeScript server plugin to inject pattern resolution algorithm in the language service
 * https://github.com/angelozerr/tsserver-plugins Load TypeScript 2.3.x tsserver plugins with TypeScript < 2.3.x
 * https://github.com/RyanCavanaugh/sample-ts-plugin2#readme External Files Walkthrough


### other related tools 

 * https://github.com/wessberg/TypescriptASTUtil
 * https://github.com/wessberg/CodeAnalyzer

 
# Some helpful notes

 * know the type by the jsdoc comment or inferring: (let constructorType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);)
 * how to know which modifiers a node has ( return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 || (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);)

## TODO

 * sample-ts-plugin docco and static pages - is a ts plugin tutorial!!!