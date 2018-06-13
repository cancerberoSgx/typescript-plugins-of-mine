# Obsolete

obsolete by typescript-plugin-proactive-code-fixes - code fix methodDelegate. 



# typescript-plugin-method-delegate


A TypeScript Language Server Plugin that will suggest to create methods that delegate in implementatoin of selected property.

 * Editor agnostic - tested on Visual Studio Code and Atom but it should work on any TypeScript-aware editor

# Demo

 * ![Adding types in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-method-delegate/doc-assets/vscode.gif?raw=true?p=.gif)


# How to use: 
```sh
npm i --save-dev typescript-plugin-method-delegate
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-method-delegate"
    }]
    ...
  }
}
```

Make sure you have installed typescript in your project (`npm i --save-dev typescript`) the editor you are using uses that typescript and not another. For example, Visual Studio Code comes with its own typescript version, so I need to "Select TypeScript Version" of the workspace: 
```json
{
  // Specifies the folder path containing the tsserver and lib*.d.ts files to use.
  "typescript.tsdk": "node_modules/typescript/lib"
}
```
