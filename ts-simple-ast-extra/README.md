# ts-simple-ast-extra

High level TypeScript Compiler API and TypeScript/JavaScript refactor APIs based on ts-morph (ex ts-simple-ast) library.

## Contents

<!-- toc -->

- [Summary](#summary)
- [Install](#install)
- [Usage](#usage)
- [Refactors](#refactors)
  * [addBracesToArrowFunctions](#addbracestoarrowfunctions)
  * [format](#format)
- [API docs](#api-docs)
- [CHANGELOG](#changelog)
- [TODO](#todo)
- [Related projects](#related-projects)

<!-- tocstop -->

## Summary

 * Browser support (out of the box)

 * Many APIs for project's **code refactors**. 
   * in general based on TypeScript built in code fixes and refactors
   * Easy to use.
   * Configurable
   * Composable
   * Have tests but use at your own risk

 * APIs useful to me that unfortunately are out of topic to pull them to in ts-morph like astPath or generalNode abstraction or 

 * utilities related with TypeScript Plugin development like abstract types, Tests Helpers, AST, repeated code, codefixes generic structure, etc

 * Access to not so public areas of TypeScript APIs or some encapsulated hacks

## Install

```
npm install ts-simple-ast-extra
```

## Usage

NOTE: Currently, although there is API documentation I would say the best source of documentation are the test. 

 * There are many different kind of APIs. Each file in src implements a "topic". 
 * Each file or "topic" has a test at `spec` folder using the same name. At the beggining there is alwasys a simple usage
`src/refactor` contain many interesting code refactors at the project level

## Refactors

In general they have the same API, you pass a SourceFile and the Project (they need access to the LanguageService):


### addBracesToArrowFunctions

```ts
import {Project, addBracesToArrowFunctions} from 'ts-simple-ast-extra'
const project = new Project()
const f = project.createSourceFile('f1.ts',  `
  const c = a => a+1
  export f = (b:number h: Date[])=>null
`)
addBracesToArrowFunctions(project, f)
console.log(f.getText())
/*
const c = a => { 
  return a + 1; 
} 
export f = (b:number h: Date[])=>{ 
  return null; 
}
*/
```

### format

```ts
import {Project, format} from 'ts-simple-ast-extra'
const project = new Project()
const file = project.createSourceFile('f2.ts',  `
function f(){
alert(1);
log(2,function(){
return 1+g(a=>{
return 2
}              )
}    );
}`)
const output = format({
  file,
  project,
  trailingSemicolons: 'never',
  indentSize: 2,
})
console.log(f.getText())
/*
function f() {
  alert(1)
  log(2, function() {
    return 1 + g(a => {
      return 2
    })
  })
}
*/
```

## API docs

[See API docs](https://cancerberosgx.github.io/typescript-plugins-of-mine/ts-simple-ast-extra/)

## CHANGELOG

[CHANGELOG.md](CHANGELOG.md)

## TODO

[TODO.md](TODO.md)

## Related projects

 * [../typescript-ast-util](typescript-ast-util) - similar objectives but independent on any library accessing directly TypeScript API