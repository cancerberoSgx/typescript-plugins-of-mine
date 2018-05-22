
# Troubleshoot

 * debug tsserver: 

 export TSS_LOG="-logToFile true -file `pwd`/tsserver_log.log -level verbose"


 
## useful links
 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin
 * https://github.com/Microsoft/TypeScript/tree/master/src/services/codefixes
 * https://basarat.gitbooks.io/typescript/content/docs/compiler/overview.html


### Related tools 
 * https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributestypescriptserverplugins
 * https://dsherret.github.io/ts-simple-ast/  <<--- this looks good for refactoring
 * https://github.com/wessberg/TypescriptASTUtil
 * https://github.com/wessberg/CodeAnalyzer
 https://github.com/RyanCavanaugh/dts-dom

## Language server protocol


https://github.com/Microsoft/language-server-protocol/blob/gh-pages/specification.md
https://github.com/theia-ide/typescript-language-server

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


## MISC 
https://stackoverflow.com/users/1704166/ryan-cavanaugh
https://github.com/Microsoft/TypeScript/tree/master/src/services/codefixes

