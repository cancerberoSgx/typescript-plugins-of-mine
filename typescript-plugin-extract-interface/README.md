# typescript-plugin-extract-interface

A TypeScript Language Server Plugin to extract an interface from an existing class. 

**WIP - right know ti generates an interface for methods and properties. **

But The very basics is working (just one day of work it really needs more!). But leave the screencast so we all understand what's this all about: 

![extract interface screencast WIP](doc-assets/extract-interface.gif)

#How to use: 
```sh
npm i --save-dev typescript-plugin-extract-interface
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-extract-interface"
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


# ISSUES / TODOS

 * make the class implement the interface at the end
 * if the class already implements an interface, we shouldn't extract those methods. 
 * what about methods of super classes ? this behavior could be configurable
 * put the interface in a separate file and add an import?
 * fix format
 * feature, if user selects only some methods, we should only extract those. 