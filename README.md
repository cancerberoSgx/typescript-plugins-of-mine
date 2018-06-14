[![Build Status](https://travis-ci.org/cancerberoSgx/typescript-plugins-of-mine.svg?branch=master)](https://travis-ci.org/cancerberoSgx/typescript-plugins-of-mine)
[![Coverage Status](https://coveralls.io/repos/cancerberoSgx/typescript-plugins-of-mine/badge.svg)](https://coveralls.io/r/cancerberoSgx/typescript-plugins-of-mine)


TypeScript Language Service plugins for useful code fixes and refactors available in other typed languages IDEs ike Java / eclipse. Most of them are currently being implemented [sub-package typescript-plugin-proactive-code-fixes](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes). See there for details and live demo. 
 


## List of work produced: 


# typescript-plugin-proactive-code-fixes

By far the most important package that implement all the "interesting refactors". It's a TypeScript Language Service Plugin with several small proactive code refactors like creating constructor when a non existent one is invoked, declaring a variable or class when non existent one is defined, etc

 * (with lots of demos and descriptions) [Project home ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes)



### typescript-plugin-move-file

 * well-tested - **safe to use**
 * Move a file or folder fixing all imports to point to the new location. 
 * Based on [ts-simple-ast](https://dsherret.github.io/ts-simple-ast) file and directory move() operation
 * Uses
   [typescript-plugins-text-based-user-interaction](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugins-text-based-user-interaction)
   for interacting with the user via the source file itself.  Ugly user experience but editor agnostic (tested with vscode and
   atom - but should work on many more!)
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-move-file)
 * See it in Action: 
 <!-- * ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif) -->
 * see more demos in other editors in [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-move-file)

### typescript-plugin-move-declaration

 * WIP - **not safe yet**
 * Move any declaration to another file - a.k.a **move an exported class/interface/function/etc to another
   file**
 * Uses
   [typescript-plugins-text-based-user-interaction](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugins-text-based-user-interaction)
   for interacting with the user via the source file itself. Ugly user experience but editor agnostic (tested with vscode and
   atom - but should work on many more!)
 * Uses [ts-simple-ast](https://dsherret.github.io/ts-simple-ast)
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-move-declaration)
 <!-- * See it in Action: ![Moving an interface to another
   file](https://raw.githubusercontent.com/cancerberoSgx/typescript-plugins-of-mine/master/typescript-plugin-move-declaration/doc-assets/vscode-move-interface.gif) -->
 
### typescript-plugin-add-type


 * well-tested - **safe to use**
 * If user selects an identifier that has no explicit type declared this plugin will suggest you to automatically add the type inferred by the compiler. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-add-type)
 <!-- * DEMO: ![Adding types in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-add-type/doc-assets/vscode.gif?raw=true?p=.gif) -->




### typescript-plugin-subclasses

 * well-tested - **safe to use**
 * user has to select (part of) the name of class of interface for refactor to be suggested
 * prints the output at the end of current file with links to the exact position (ctrl-click will take you there)
 * See it in action: 
 <!-- * ![subclasses-of screencast
   WIP](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-subclasses-of/doc-assets/screencast.gif?raw=true?p=.gif) -->
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-subclasses)

### typescript-plugin-ast-util

 * well-tested - **safe to use**
 * Tools useful for TypeScript Language Service Plugin developers, see demo and description at [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-ast-util), currently printing AST of selection and printing class/ interface hierarchy. 

### TypeScript Language Service Plugin Tutorial

The result of my first steps dealing with TypeScript Language Service. I was so happy with my first plugin (useless) that I write a tutorial : 

 * **[Tutorial with code](https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/)**
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)


### TypeScript Language Service Plugin Tutorial

The result of my first steps dealing with TypeScript Language Service. I was so happy with my first plugin (useless) that I write a tutorial : 

 * **[Tutorial with code](https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/)**
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)


### typescript-plugin-method-delegate

 * Deprecated by typescript-plugin-proactive-code-fixes moveInterface code fix refactor
 * well-tested - **safe to use**
 * suggest a refactor to create delegate methods to selected property
 * See it in action: 
 <!-- * ![subclasses-of screencast
   WIP](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-method-delegate/doc-assets/vscode.gif?raw=true?p=.gif) -->
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-method-delegate)

### typescript-plugin-extract-interface
 
 * Deprecated by typescript-plugin-proactive-code-fixes moveInterface code fix refactor
 * well-tested - **safe to use**
 * While inside a class, when you select something it activates and suggest "Extract interface". It generates the interface right after the class declaration. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-extract-interface)
 * See it in Action: 
 <!-- * ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-interface/doc-assets/extract-interface.gif?raw=true?p=.gif) -->


### utility projects

While developing these I realized There was too much repeated code so I ended up writing some utilities project: 

 * [typescript-plugins-text-based-user-interaction](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugins-text-based-user-interaction) a very small library starting to implement a very big
   idea: a way of interact with the editor's user through the source file itself so plugins can inquire
   information interactively independently of the editor/IDE being use. 
 * Or in other words, plugin authors don't need to learn/implement an editor's specific API/technology in
   order wo ask the user for input) 
 * Or in other words, typescript plugins editor/ide agnostic (run on any editor/ide that support TypeScript
   Language Service)
 * [typescript-plugin-util](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-util)
 * [typescript-ast-util](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-ast-util)







## About this project

 * I'm learning [TypeScript compiler
   API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API), and [TypeScript Language Service
   plugins](https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin). 
 * I didn't found refactor plugins like move method, move class, extract interface, method delegate. etc.
   Search a lot didn't found anything.
 * The objective is to build well-tested typescript plugins to support these refactors, if possible, editor
   agnostic (others can program the nice GUIs for each editor)
 * This project is a mono-repo using [yamat](https://github.com/cancerberoSgx/yamat) - tool made by myself after fighting with complexities of lerna, yarn workspaces and rush. 



## Status

 * fun and learning. Exiting with TLS APIs and w the fact this is working on more than one editor coherently. 
 * main focus on [sub-package typescript-plugin-proactive-code-fixes](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes)
 * more and more ideas come to mind while I'm programming so its both things impl and requirements
 * plugins not tested exhaustive - objective more a demo and performance tests (proof of concepts) than production ready product
 * there are some old (firsts) plugins that probably are broken and need a review to use "newer technologies" (extract-interface, method-delegate)
 * other projects are too green: move-declaration
 * more and more dependant to ts--simple-ast - at the beggingin I had my doubts but in my position it saved lots of time and performance is not SO bad. 
 * other ideas / projects are being implemented slowly by typescript team (getters&setters, move to file (new file - not the same)) - point here is that probably ts team will reach to similar conclusions ideas than me and implmenet them the right way and more aligned with vscode. 
 * others that dont make any sense or need a redesign / requirement :: subclasses-off, add-type
 * others that are too strange UX / UI but still could be usefull to back up a concreate editor plugin (move-file, move-declaration)
 * editor portability: atom and vscode works and are coherent. couldn't make it work on webstorm (the plugin is created but couldn't find any UI action to trigger its refactor suggestions.). others like sublime, emacs, vim, eclipse, netbeans doesn't seem to support TLS but I should investigate more. Probably if the same experience can be accomplished with codefix concept : i tried and I couldn't make the edition part to work . I was able to prompt suggestion's but I wasn't able to call the activation handler (or I didn't found which was it)


## TODO / ROADMAP


 * Each project has its own TODO / ROADMAP section in readme or separate file. 


## Useful commands

### clean up everything install and rebuild and run tests of all projects:

```sh
npm run all 
```

### setup development mode (linked packages):

```sh
npx yamat link && \
npx yamat run "rm -rf node_modules package-lock.json" && \
npx yamat run "npm i"  && \
npx yamat run "npm run build" && \
npx yamat run npm test && \
echo end
```

### setup "pack" mode to test publishing without actually publishing

```sh
npx yamat run "rm -rf node_modules package-lock.json" && \
npx yamat run npm i && \
npx yamat unlink --version pack && \
npx yamat run "rm -rf node_modules package-lock.json" && \
npx yamat run npm i && \
npx yamat run npm run build && \
npx yamat run npm run test && \
echo end
```

Notice that : 
 
 * we clean up each module and npm install before yamat unlink so modules can build them self beforepublish/pack
 * we dont run npm run build before  yamat unlink so we test that packages have the npm script  prepare - should build themself on npm publish - npm pack

### increment patch version on each package and publish them (run after previous command (unlink)):

```sh
npx yamat run "npm version patch" &&\
npx yamat unlink &&\
npx yamat --break-on-error no run npm publish &&\
echo end
```