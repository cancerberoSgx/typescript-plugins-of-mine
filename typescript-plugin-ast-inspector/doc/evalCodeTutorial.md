
Speeding up Typescript Language Service (TLS) plugin code development using typescript-plugin-ast-inspector

 * This is a template to evaluate  based code quickly (without having to install / compile / restart the server, see the logs, etc.)
 * We just evaluate code in this same source file and print expressions back in here
 * I often use this as an starting point when developing new TLS plugins
 * In this example I will create a "Plugin" that changes string literal quotes from double to simple ones. 
 * It uses [ts-simple-ast](https://dsherret.github.io/ts-simple-ast) but this is entirely optional. 

# Install the plugin

As with any TypeScript plugin, let's create a new project, enable typescript and install this plugin there:

```sh
mkdir my-project1 && cd my-project1
npm init -y
npm i --save-dev typescript typescript-plugin-ast-inspector
npx tsc --init
```

Now declare the plugin in your project's `tsconfig.json`: 

```json
{
 "compilerOptions": {
    "plugins": [
      {
       "name": "typescript-plugin-ast-inspector"
      }
    ]
  }
}
```

# Using it

You will be able to test this at least in Visual Studio Code Editor and Atom Editor. 

## Visual Studio Code

Since Visual Studio Code comes with its own typescript version that uses by default, so I need to "Select TypeScript Version" of the workspace by ctrl-shift-p: and "TypeScript: Select TypeScript Version" : "Use Workspace's" or by configure the following workspace setting:  

```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Atom Editor

Using [atom-typescript package](https://atom.io/packages/atom-typescript) works out of the box. 

# Code Eval time !  

 * Copy [evalCodeTemplate.ts]() in your project. 
 * Install the following dependencies:  
 
```sh
npm i --save typescript-plugin-ast-inspector ts-simple-ast
```

 * open the project with vscode or with atom: 

```sh
code my-project1
atom my-project1
```

 * the file details step by step how start playing around with TypeScript apis by evaluating code quicly in the same source file. ANyway the following is a demo of myself step by step: 
 * ![Tutorial demo](https://raw.githubusercontent.com/cancerberoSgx/typescript-plugins-of-mine/master/typescript-plugin-ast-inspector/doc-assets/evalCodeVsCode.gif)


# References

For more information about TypeScript compiler and TLS APIs see: 

 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin
 * tutorial: https://cancerberosgx.github.io/typescript-plugins-of-mine/sample-ts-plugin1/src/