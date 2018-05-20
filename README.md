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


### typescript-plugin-move-file

 * Move a file or folder fixing all imports to point to the new location. 
 * Based on [ts-simple-ast](https://dsherret.github.io/ts-simple-ast) file and directory move() operation
 * Uses
   [typescript-plugins-text-based-user-interaction](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugins-text-based-user-interaction)
   for interacting with the user via the source file itself. 
 * See [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-move-file)
 * See it in Action: 
 * ![See it in Action: ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif)
 * see more demos in other editors in [Project home](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-move-file)

### typescript-plugin-subclasses

**WIP**

 * user has to select (part of) the name of class of interface for refactor to be suggested
 * prints the output at the end of current file with links to the exact position (ctrl-click will take you there)
 * See it in action: 
 * ![subclasses-of screencast WIP](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-subclasses-of/doc-assets/screencast.gif?raw=true?p=.gif)

### typescript-plugin-add-type

 * if current selection is a declaration without an explicit type, this plugin will suggest you to automatically add the type inferred by the compiler. 
 * [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/s)

### typescript-plugin-ast-util

 * Tools useful for TypeScript Language Service Plugin developers, see demo and description at [Project](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-ast-util), currently printing AST of selection and printing class/ interface hierarchy. 

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
