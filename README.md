Experiments with typescript compiler API, and Language Service plugins.

Note: this is a monorepo made with http://rushjs.io/

## plugin ideas

 * extract interface from class
 * move method to other class (complicated - move interfaces also or classes hierarchy!)
 * move node (class, interf, function to other file) - complicatoin: exported nodes! must change other's imports
 * add explicit type: select an identifier without explicit type - a refactor add its type based on the inferred one.
 * show the ast tree (simplified) of current keyword (DONE!)
 * show all subclasses of current class/interface - show all implementors off current interface. 

## sample-ts-plugin1

My first plugin that customize autocomplete suggestions and add a refactor suggestion. See the tutorial - with code and screen-cast here : 
https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/

How to test plugins. For example, we have sample-ts-plugin1 and sample-ts-plugin1-sample-project

* `code sample-ts-plugin1-sample-project`
* because it has .vscode/settings.json -  "typescript.tsdk": "node_modules/typescript/lib"  it vscode should use typescript version from its node_modules. 
* ** verify in vscode "select typescript version" of the workspace. and reload tsserver
* because tsconfig.json has `plugins` installing sample-ts-plugin1 that plugin should be loaded by tsserver. 
(https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/plugin-screencast.gif)[see screencast]
* select one identifier in the editor and you will see refactor suggestions. Also it wont autocomplete a.caller , only thisIsTheOnlyThatWillAutoComplete proeprty
* now make a change in the plugin, like changing the string "sebarefactiondesc", run "rush rebuild", restart ts server in vscode and that label should be shown as refactor suggestion label. 
* for debugging and seeing messages from plugin in tsserver exec: 
 `export TSS_LOG="-logToFile true -file `pwd`/tsserver_log.log -level verbose"`


## useful links
 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin


## typescript plugins I've found over there:

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


## other related tools 

 * https://github.com/wessberg/TypescriptASTUtil
 * https://github.com/wessberg/CodeAnalyzer

 
## TODO

 * sample-ts-plugin docco and static pages - is a ts plugin tutorial!!!