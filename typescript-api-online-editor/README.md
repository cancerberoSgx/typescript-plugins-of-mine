# TypeScript Compiler API online editor

Play with TypeScript compiler API and others online: [TypeScript Compiler API online playground](https://online-typescript-api-editor.glitch.me/)

(WIP)

# Objectives / Features

Basically is a server side node.js application that let the user input two TypeScript source files, one is its program using TypeScript compiler APIs and others, and the second is an example TypeScript source file that will be manipulated by the first program. Then the Program is evaluated server-side and the results are printed back to the browser (proabbly modifying the example source file)

It has lots of working examples using different TypeScript APIs and related libraries. 

Thanks to glitch infrastructure is online! https://online-typescript-api-editor.glitch.me/

Easily run in local host (TODO: command

Uses the great TypeScript monaco-editor so the experience is incredible

The idea is being able to point to users to these examples so they can play online with them when asking for help. 


# TODO

 * user being able to save / load its work - cheap solution like typescript playground use url parameters as source code input. 



# Notes / difficulties / learning

 * editor.js - is a handlebars template that contains big ibraries like typescript.d.ts embedded inside
 
 * for typescript.d.ts to work we need to add the following to the top of the file:

```
declare module "typescript"{
    export = ts
}
```

 * server evaluates several .ts that it will execute handlebar template editor.js - for agile development - in production we should do it better