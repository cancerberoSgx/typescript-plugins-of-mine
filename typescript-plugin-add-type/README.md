# typescript-plugin-add-type

WIP

A TypeScript Language Server Plugin to add the type to those variables that do not declare any. Sometimes is simply too hard to copy&paste with the mouse the type of a node from the tooltip of vscode and really necessary to add a type. 

The refactor suggestion will only when a variable without type is selected

TODO: screencast, general readme, test all examples: 

  // function f ()$TYPE {}
  // function()$TYPE {} // should not enter because of no name
  // method()$TYPE {}
  // class C { property1$TYPE = 2 }
  // class C {property1$TYPE = 'va'}
  // var a$TYPE = 2
  // function(param1$TYPE, param2){}
  // each((c) $TYPE => true)
  // each((c$TYPE)  => true)

 
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


TODO/IDEAS

* generics / static types ? 
* what about a tool that add all missing types to all named declarations in the entire sourcefile ? 
* what about a tool that remove all the explicit types that can be removed with out introducing a compilation error ? (so code is cleaned)
