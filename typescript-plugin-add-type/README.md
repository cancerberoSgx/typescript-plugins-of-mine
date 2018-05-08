# typescript-plugin-add-type

A TypeScript Language Server Plugin to add the type to those variables that do not declare any. Sometimes is simply too hard to copy&paste with the mouse the type of a node from the tooltip of vscode and really neccesary to add a type. 

The refactor suggestion will only when a variable without type is selected



 
<!-- ![extract interface screen cast WIP](doc-assets/add-type.gif) -->

#How to use: 
```sh
npm i --save-dev typescript-plugin-add-type
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-add-type"
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

