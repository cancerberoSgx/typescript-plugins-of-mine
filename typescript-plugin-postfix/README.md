# typescript-plugin-postfix

vscode-postfix-ts as a TypeScript Language Service plugin

See https://github.com/ipatalas/vscode-postfix-ts/issues/13#issuecomment-391607482

Enhancement: let postfix implementors decide to which expression to apply the Postfix interactively if the current
expression is complex, for example

a*3 + Math.pi/2.let

The user intends to declare a new variable, Could be for expression "2" or for `a*3 + Math.pi/2`


<!-- 
# Demo

 * declaring variables an constructors on the fly (Visual Studio Code Editor) : 
 * ![vscode demo creating variables and constructors declarations vscode ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-postfix/doc-assets/vscode.gif?raw=true?p=.gif)
 * Atom Editor:
 * ![vscode demo creating variables and constructors declarations atom](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-postfix/doc-assets/atom.gif?raw=true?p=.gif)  -->


# How to use: 
```sh
npm i --save-dev typescript-plugin-postfix
```

in your `tsconfig.json`, add the plugin: 

```json
{
  "compilerOptions": {
    ...
    "plugins": [{
        "name": "typescript-plugin-postfix"
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
