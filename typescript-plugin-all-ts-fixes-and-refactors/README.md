# typescript-plugin-all-ts-fixes-and-refactors

This is just a test project - not serious or useful - that gets and shows all typescript code fixes.

TypeScript has a lot of useful code fix and refactors inside. since the editor is not suggesting me any of these and also they dont appear in getSUggestedDiagnosics() make a plugin that includes all of them in getSUggestedDiagnosics(). If they are there then they should be shown in the editor. 
 Also this is kind of configurable ex: prefer arrow functions with braces, prefer async instead of promises,  prefer namespace import or named imporst. So this plugin should have a configuration (would be perfect in vscode). 

 Example code that prints all the code fixed supported out of the box: 
 
```
  fit('research', () => {
    const supported = ts.getSupportedCodeFixes().map(s => parseInt(s, 10))
    const tsDiagnostics = getTsDiagnostics()
    const supportedMessages = tsDiagnostics.filter(d => supported.includes(d.code)).map(d => `${d.code} - ${d.message}`).join('\n')
    console.log(supportedMessages);

  })
  interface TsDiagnostic {
    code: number,
    category: number,
    key: string,
    message: string,
    reportsUnneccesary: any
  }
  function getTsDiagnostics(): TsDiagnostic[] {
    return Object.values((ts as any).Diagnostics)
  }
```


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
