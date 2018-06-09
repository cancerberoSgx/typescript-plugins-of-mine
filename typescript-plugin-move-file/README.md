# TypeScript plugin for moving files or folders

 * Move/rename a file or folder fixing all imports to point to the new location in all the TypeScript project
 * Based on [ts-simple-ast])(https://dsherret.github.io/ts-simple-ast) file and directory move() operation
 * Editor / IDE agnostic - it should work on any editor that supports TypeScript Language Plugins. Uses
   [typescript-plugins-text-based-user-interaction](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugins-text-based-user-interaction)
   for interacting with the user via the source file itself. 

# Demos

Moving and renaming a file in Visual studio Code Editor: 

 * ![Moving and renaming a file in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif)

Editor agnostic!. See the same demo but in Atom editor: 
 
 * ![Moving and renaming a file in Atom 
   Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/atom-move-file.gif?raw=true?p=.gif)




# How to use

```sh
npm i --save-dev typescript-plugin-move-file
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    "plugins": [{
        "name": "typescript-plugin-move-file"
    }]
  }
}
```


Make sure you have installed typescript in your project (`npm i --save-dev typescript`) the editor you are using uses that typescript and not another. For example, Visual Studio Code comes with its own typescript version, so you need to "Select TypeScript Version" of the workspace: 
```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

In Atom editor, if you use [atom-typescript package](https://atom.io/packages/atom-typescript) you don't need to do anything since by default it will use the workspace's TypeScript version.


# TODO
 * move folder is broken
 * show confirmation in the current sourcefile (large projects take several seconds)
 * notify last error - adding a comment just below the &%&% comment that failed
 * option to undo-last-action