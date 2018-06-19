TypeScript Language Service Plugin plugin with several refactors related to function-like signature. 

**WIP* - **very new** 

# About the project

 * use typescript-plugins-text-based-user-interaction
 * expose API so concrete editor extensions can use it, probably mine TypeScript refactors asking input with a nice UI instead of TextUITool
 * based on ts-simple-ast


# Refactors 

## change parameter order (reorderParams). 

 * Demo: 

![Reorder parameters demo:](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-function-signature-refactors/doc-assets/reorderParamsVsCode.gif?raw=true?p=.gif)

How to use it: Imagine you have a function declaration like the following. 

```ts
function prettyFunction(a: string, b: number, c: Date[], d: Promise<Number>): boolean { return null }
```

Then just start writing "refactor" in some place **inside** that function declaration or call and autocomplete with the text "reorder parameters of prettyFunction" will be suggested: 

```
function prettyFunction(a: string, b: number, c: Date[], d: Promise<Number>): boolean { 
  /* &%&% reorderParams("prettyFunction", [3, 2]) */
  return null }
```

A comment will be created when you accept that autocomplete. If you ask for refactors at that comment you will be suggested with "Reordered parameters of 'blow'" and if you accept the function/signature/call parameters order will be changed accordingly and all its references in the project.

## Reorder syntax

The second parameter in `reorderParams()` call defines how parameters will be reordered. 

In our previous example it was `[3, 2]` and it means: move first parameter to the 3rd place and the second parameter to the 2nd place so for example `(a, b, c, d)` will end up in `(c, d, b, a)`

The rule is this one: **Number N in index M means move the M-th argument to index N.**

Also notice that parameters not referenced in this array will shift to the left in order to comply with the new order. For example, if we reorder `(a, b, c)` using `[2]` this will move a to the third place so `b` and `c` automatically will shift one place to the right, resulting in `(b, c, a)` 

# TODO

 * refactor a implementation method wont change its interface signature - super 
 * constructors not supported



# Ideas 

 * Idea: make some params and/or return type an array of the current type. That should be easy to implement witout introducing errors and refactoring the whole project
 * Idea: change parameter modifiers (question, scope, init)
 * **add new parameter**. `addNewParam({functionDeclarationName: 'prettyFunction', paramIndex:"2", paramName: 'color', paramType: "string[]", paramDefaultValue: '[]'}). ` (paramDefaultValue will be used to fill current calls references)
 * **remove parameter**. We can do it - will it break the project ? I don't think so... `removeParam({functionDeclarationName: 'prettyFunction', paramIndex:"2"}). `
 * **change parameter type** - this should be the hardest thing to implement. The following could be an starting point. Using templates for new type and values:  
   * Example  "arrayize" : ```changeParamType({functionDeclarationName: 'prettyFunction', param:"2",paramType:old=>`[${old}]`, argumentValue: old=>`[${old}]`})```. (notice how user can also enter a template for refactor arguments in reference calls) 
   * Example "functionalize" : ```changeParamType({functionDeclarationName: 'prettyFunction', param: 2, newIndex: 4, newName: 'fn', paramType: old=>`(arg: ${old}|undefined):Promise<boolean>`, argumentValue: old=>`(${old})=>!!${old ? 'Promise.resolve(true)' : 'Promise.reject()'}`})```
   * Example: "wrap in a container-like "Home" class": ```changeParamType({functionDeclarationName: 'prettyFunction', param:1, newIndex: 4, newName: old=>`${old}Home`, paramType: old=>`Home<${old}>`, argumentValue: old=>`new Home<${old}>()`, requireImport: '../Home'})```

    *Interesting notes*: 

      * requireImports: user gives one file path - we assure is imported on all modified files correctly.
      * newIndex: user can change the order at the same time
      * newName and newType : user is responsible of creating name and type factories that could be based on the old name/type
      * argumentValue: user can provide a dynamic value for existing call references. If none is providen then we could still add 1undefined to the type and pass undefined - or add a questionmark to the param
      * validation: optional params - must be to the end - no args qith same name, invalid types or identifiers. THis should be easily solved by compiling a dummy signature using user input and print errors back to the user for validation. 


 * change parameter name: - not useful since that refactor already exist in ts
 * or more general than all previous - When we had implemented all the previous refactors individually we could make a super container refactor in which the user can modify the param list signature a piaccere... with some rules , validation and helpers. 
 * **type parameters** add/remove/rename/change-index/change-thingy Type Parameter. User should be able to provide default value template, for using it in call references 

# TODO

  * proactive toNamedParams should be moved here
  * when large refactors are done, perhaps is good idea to print report to the user saying how many nodes and files were changed ?
  * dont forget about constructors, setters/getters
  * dont forget about object literal expressions
  * and simple properties (non callables) - these have signatures too