# typescript-plugin-ast-inspector

Tools oriented to TypeScript developers, specially those dealing with AST, like Language Service Plugin developers. 

* print AST : will print the AST (with easy format) of the selected code
* print from current node to the top-most parent so we know our "deep" in the AST situation

<!-- ![subclasses-of screencast WIP](doc-assets/screencast.gif) -->

## How to use: 

```sh
npm i --save-dev typescript-plutypescript-plugin-ast-inspector
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plutypescript-plugin-ast-inspector"
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
