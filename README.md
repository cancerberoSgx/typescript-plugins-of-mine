Experiments with typescript compiler API, and Language Service plugins.

## List of work produced: 


### typescript-plugin-extract-interface

 * well-tested - **safe to use**
 * While inside a class, when you select something it activates and suggest "Extract interface". It generates the interface right after the class declaration. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-extract-interface)
 * See it in Action: 
 * ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-interface/doc-assets/extract-interface.gif?raw=true?p=.gif)

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
 * ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif)
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
 * See it in Action: ![Moving an interface to another
   file](https://raw.githubusercontent.com/cancerberoSgx/typescript-plugins-of-mine/master/typescript-plugin-move-declaration/doc-assets/vscode-move-interface.gif)
 
### typescript-plugin-add-type

 * well-tested - **safe to use**
 * If user selects an identifier that has no explicit type declared this plugin will suggest you to automatically add the type inferred by the compiler. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-add-type)
 * DEMO: ![Adding types in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-add-type/doc-assets/vscode.gif?raw=true?p=.gif)

### typescript-plugin-method-delegate

 * well-tested - **safe to use**
 * suggest a refactor to create delegate methods to selected property
 * See it in action: 
 * ![subclasses-of screencast
   WIP](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-method-delegate/doc-assets/vscode.gif?raw=true?p=.gif)
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-method-delegate)

### typescript-plugin-subclasses

 * well-tested - **safe to use**
 * user has to select (part of) the name of class of interface for refactor to be suggested
 * prints the output at the end of current file with links to the exact position (ctrl-click will take you there)
 * See it in action: 
 * ![subclasses-of screencast
   WIP](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-subclasses-of/doc-assets/screencast.gif?raw=true?p=.gif)
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-subclasses)

### typescript-plugin-ast-util

 * well-tested - **safe to use**
 * Tools useful for TypeScript Language Service Plugin developers, see demo and description at [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-ast-util), currently printing AST of selection and printing class/ interface hierarchy. 

### TypeScript Language Service Plugin Tutorial

The result of my first steps dealing with TypeScript Language Service. I was so happy with my first plugin (useless) that I write a tutorial : 

 * **[Tutorial with code](https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/)**
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/sample-ts-plugin1)

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
 * This project is a mono-repo using [yamat](https://github.com/cancerberoSgx/yamat)
