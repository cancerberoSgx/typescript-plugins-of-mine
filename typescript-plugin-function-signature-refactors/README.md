TypeScript Language Service Plugin plugin with several refactors related to function-like signature. 

**WIP* - **very new** 


# Refactors 

## change parameter order (reorderParams). 

How to use it: Imagine you have a function declaration like the following. Then just start writing "refactor" and autocomplete with the text "reorder parameters of prettyFunction" will be suggested: 

```
function prettyFunction(a: string, b: number, c: Date[], d: Promise<Number>): boolean { return null }
```

It could be any function-like declaration, call, method, signature, etc . It could be before or after the cursor. Selecting that autocomplete suggestion will it will prompt the user to enter which parameters / arguments should be moved and where:

```
// &%&% reorderParams("prettyFunction", [3, 2])
function prettyFunction(a: string, b: number, c: Date[], d: Promise<Number>): boolean { return null }
```
In that example the result will be the following: 

```function prettyFunction( c: Date[], d: Promise<Number>,  b: number, a: string): boolean { return null }```

`[3, 2]` means: move 0th argument to the 3rd place and 1th argument to the 2nd place

Alternatively user could copy and paste the arguments literals and do it using their text but in this case they will be responsible of not introducing errors on this manual task: 

```
// &%&% reorderParams("prettyFunction", `b: number, c: Date[], a: string, d: Promise<Number>`)
```

TODO: This last part is not impl yet

# About the project

 * use typescript-plugins-text-based-user-interaction
 * expose API so concrete editor extensions can use it, probably mine TypeScript refactors asking input with a nice UI instead of TextUITool
 * based on ts-simple-ast

# Ideas 

 * Idea: make some params and/or return type an array of the current type. That should be easy to implement witout introducing errors and refactoring the whole project
 * Idea: change parameter modifiers (question, scope, init)
 * **add new parameter**. `addNewParam({functionDeclarationName: 'prettyFunction', paramIndex:"2", paramName: 'color', paramType: "string[]", paramDefaultValue: '[]'}). ` (paramDefaultValue will be used to fill current calls references)
 * **remove parameter**. We can do it - will it break the project ? I don't think so...
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

  * perhaps proactive toNamedParams should be moved here
  * dont forget about constructors, setters/getters
  * dont forget about object literal expressions
  * and simple properties (non callables) - these have signatures too