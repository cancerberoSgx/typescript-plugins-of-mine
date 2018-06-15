[![Build Status](https://travis-ci.org/cancerberoSgx/typescript-plugins-of-mine.svg?branch=master)](https://travis-ci.org/cancerberoSgx/typescript-plugins-of-mine)
[![Coverage Status](https://coveralls.io/repos/cancerberoSgx/typescript-plugins-of-mine/badge.svg)](https://coveralls.io/r/cancerberoSgx/typescript-plugins-of-mine)

# typescript-plugin-proactive-code-fixes

TypeScript Langauge Service Plugin with several small proactive code refactors to solve errors (diagnostics) like creating constructor when a non existent one is invoked, declaring a variable or class when non existent one is defined, reassigning a const, etc. The tool is based both on the context of the user and on the current diagnostic error in cursor position / selection

The objective is to provide most refactor suggestions for agile code development seen in other strongly typed languages / IDEs like Java/eclipse 

In general refactors are non aggressive so the shouldn't do harm. Still more testing is needed and some suggestions appear where they shouldn't or viceversa doesn's appear in al places where they should. Still I think it's useful and is sowly reaching the objective. 

# Fixes and Refactors

A lot is still to be fixed and implemented but we have several helpful and stable fixes working already:

## Prototyping

 * declare a new class or interface when trying to extend or implement something that doesn't exist
 * [Declare an interface from return value](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-interfaces-from-return-values)

## Fixing and refactoring variables

 * [Variable declaration list split in different stataments](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)
 * [Declare missing variable](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors) 
 * [Rename duplicated variables](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)
 * [Put a name to a function declaration without one](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)
 * [Change const to let when reassigning a const variable](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors) 
 * [remove readonly keyword of property declaration when trying to modify it](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)

## Implementing types

 * [Declare missing constructors](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-constructors) when calling `new A(a,b)` on a class/interface that doesn't declare it
 * [Declare interface from return value](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-interfaces-from-return-values)
 * Fix object literal so it implements its interface or class. It will adding / remove or change object literal members so it comply with its interface or class
 * declare member - complements the code fix already existing in typescript to fullfill all cases. declaring missing properties / methods 
 * add missing return statement
 * [Declare missing classes and interfaces](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-classes-and-interfaces)
 * Make member public (change the scope of a member when expression is trying to access it)

 # Refactoring

 * [Transform parameter list into single "named" parameter](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#transform-parameter-list-into-single-object-parameter). Splits variable declaration list in individual variable statements. 
 * [Arrow Functions - add / remove body braces](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#arrow-functions-remove-and-add-body-braces).  
 * [Extract interface from class or object literal declaration](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#extract-interface-from-class-or-object-literal-declaration). 
 * [Delegate Methods to Property](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#delegate-methods-to-property)
 * [Transform string concatenation into string templates and viceversa](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#string-concatenation-to-template-and-viceversa)

# Formatting

 * change string literal quotes
 * remove empty lines form selected region 


and more to come!!

# Editor Support

**This plugin will work with any text editor that leverages TypeScript Language Service**. I've successfully tested Visual Studio Code (without any extension) and Atom editor using  [atom-typescript package](https://atom.io/packages/atom-typescript). But other editors should also work like Sublime Text, webstorm, eclipse, emacs, vim. (TODO: test)

The same example using vscode and atom is shown in [Declare an interface from return value demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-interfaces-from-return-values) and the same is true for the rest of the fixes (I only show vscode for the rest). 


# How to install and use it

```sh
npm i --save-dev typescript-plugin-proactive-code-fixes
```

In your `tsconfig.json`, add the plugin like this:

```json
{
  "compilerOptions": {
    "plugins": [{
        "name": "typescript-plugin-proactive-code-fixes"
    }]
  }
}
```

Make sure you have installed typescript in your project (`npm i --save-dev typescript`) the editor you are using uses that typescript and not another. For example, Visual Studio Code comes with its own typescript version, so you need to "Select TypeScript Version" of the workspace: 
```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

In Atom editor, if you use [atom-typescript package](https://atom.io/packages/atom-typescript) you don't need to do anything since by default it will use the workspace's TypeScript version.



# Fixes and demos


## Variable related fixes and refactors

Quick fixes when you forgot to declare variables, have duplicates, reassigning a constant or need to transform a list of variable declarations into single declaration statements, etc: 

![Variable related fixes and refactors](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/variableRelatedFixesVsCode.gif?raw=true?p=.gif)


## Transform parameter list into single object parameter

When you have functions accepting several parameters and you keep adding more and more, sometimes it's a good idea to convert the parameter list into a single parameter object that implements an interface so the contract is there and not in the function signature. 

This is particularly useful when writing APIs that need to maintain backwards compatibility. 

Select a fragment of a parameter declaration list and it will offer to declare all parameters in an interface and use them as an object literal. 

Idea taken from here: https://github.com/Microsoft/TypeScript/issues/23552

Demo in Atom editor: 

![Transform parameter list into a single object parameter Atom editor demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/convertToNamedParamsAtom.gif?raw=true?p=.gif)


## Arrow Functions remove and add body braces

![Arrow Function - remove - add body braces vscode editor demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/arrowFunctionsBodyTransformationsVsCode.gif?raw=true?p=.gif)


## Extract interface from class or object literal declaration

![Extract interface from class or object literal declaration vscode editor demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/extractInterfaceVsCode.gif?raw=true?p=.gif)


## Delegate Methods to Property

When you want to expose the methods of a property in parent class or interface. Suggested when standing in a class or interface property.

![Delegate Methods to Property-  vscode editor demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/delegateMethodVisualCode.gif?raw=true?p=.gif)


## String concatenation to templates and viceversa

![String concatenation to templates and viceversa -  vscode editor demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/template2LiteralVsCode.gif?raw=true?p=.gif)


## Declare classes and interfaces

No much to say here - if you `extends` or `implements` an class or interface that is not declared yet the refactor will suggest you to declare it. 

![Declare classes and interfaces vscode demo](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/declareClassAndInterfaceVsCode.gif?raw=true?p=.gif)


## Declare constructors

Basic refactor of any descent strongly typed language IDE

![vscode demo creating variables and constructors declarations ](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/declareConstructorVsCode.gif?raw=true?p=.gif)



## Declare interfaces from return values

Useful for quickly prototype interfaces when writing the implementation.

 * Visual Studio Code Editor

![Declare interfaces from return values - Visual Studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/declareReturnTypeVsCode.gif?raw=true?p=.gif) 

 * Atom Editor

![Declare interfaces from return values - Atom Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/declareReturnTypeAtom.gif?raw=true?p=.gif) 



# TODO

 * create a json file {production: false}. npm prepare script will change it to {production: true}. index.ts will import it and it will log and load utility plugins only if production === false so its faster on production and we can log a lot stuff and heavy utilities while development
 * config - fixes have great ideas for config but is not currently working.
 * programmatical API
 * unit test: test that the suggestion appear only when it should - in other words test for false positive predicate
 * generate tsdocs because all fixes are very well documented / roadmap. 
 * Performance - getAppRefactors is taking almost  sec. Make a generic predicate with cache (get which diags are in current position and cache it - make a generic predicate since almost all use the same thing)
 * apply all quick fixes in this file ! define a mechanism of priorities when two or more fixes attach the same position.
 * perhaps we could just recreate the simple-ast sourcefile instead of the whole project 
 * use getcodefixes instead of refactors - blocked - done but no way of defining expensive fixes
 * make sure for each if error is selected in problems view then that selection will suggest the fix
 * new member declarations should add jsdoc
 * declare return type very buggy
