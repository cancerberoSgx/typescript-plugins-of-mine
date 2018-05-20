TypeScript plugin : A Refactor TypeScript plugin for moving exported declarations to another file. 

a.k.a : **move classes, functions, interfaces, etc to other files refactor**

** WIP - use at your own risk **

## Demo

 * Moving an interface to another file: ![Moving an interface to another file](https://raw.githubusercontent.com/cancerberoSgx/typescript-plugins-of-mine/master/typescript-plugin-move-declaration/doc-assets/vscode-move-interface.gif)
 
## Features

 * Any top-level declaration can be moved from any file to an existing file of the same project
 * User interaction though the source file itself. Ugly: but allow being editor/IDE agnostic so at least this plugin
   supports Visual Studio Core and Atom editor (but other should also be supported too) 

## What's not supported yet

Important things not supported, yet:

 * only named import declarations supported: `import {a,b} from './foo'`
    * `import * as foo from 'foo'` not supported
    * `import bar from 'bar'` not supported  
 * commons.js or other module system


# How to use

```sh
npm i --save-dev typescript-plugin-move-declaration
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-move-declaration"
    }]
    ...
  }
}
```

Make sure you have installed typescript in your project (`npm i --save-dev typescript`) the editor you are
using uses that typescript and not another. For example, Visual Studio Code comes with its own typescript
version, so I need to "Select TypeScript Version" of the workspace: 

```json
{
  // Specifies the folder path containing the tsserver and lib*.d.ts files to use.
  "typescript.tsdk": "node_modules/typescript/lib"
}
```


# TODO
 * all kind of import / exports
 * moveNextDeclaration('../other/file.ts')
 * communicate errors below the comment
 * undo action
 * commons.js require() ? 
 * in sampleProject2 - move Unit interface to ../base/Thing.ts - it fails !! fix