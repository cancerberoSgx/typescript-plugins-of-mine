# typescript-plugin-subclasses-of

A TypeScript Language Server Plugin that, given a class or a interface, prints the classes (direct or indirect) it has or how many implementations, direct or indirect an interface have (and how many sub-interfaces)

**WIP - **

<!-- ![extract interface screencast WIP](doc-assets/subclasses-of.gif) -->

#How to use: 
```sh
npm i --save-dev typescript-plugin-subclasses-of
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-subclasses-of"
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
