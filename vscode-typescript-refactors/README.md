# typescript-refactors

Has several TypeScript plugins for agile code development. Most refactors and fixes are maintained in other projects, so please go there for latest documentation and demo: 
 *  [typescript-plugin-proactive-code-fixes](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes)
 * [typescript-plugin-function-signature-refactors](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-function-signature-refactors)


# Fixes and Refactors

A lot is still to be fixed and implemented but we have several helpful and stable fixes working already:


## Fixing and refactoring variables

 * [Variable declaration list split in different stataments and viceversa](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)
 * [Declare missing variable](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors) 
 * [Rename duplicated variables](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)
 * [Put a name to a function declaration without one](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)
 * [Change const to let when reassigning a const variable](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors) 
 * [Remove readonly keyword of property declaration when trying to modify it](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#variable-related-fixes-and-refactors)


## Implementing types / prototyping

 * [Declare classes and interfaces](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-classes-and-interfaces) when trying to extend or implement something that doesn't exist
 * [Declare an interface from return value](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugin-proactive-code-fixes#declare-interfaces-from-return-values)
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



# Details and demo


## Variable related fixes and refactors

Quick fixes when you forgot to declare variables, have duplicates, reassigning a constant or need to transform a list of variable declarations into single declaration statements, etc: 

![Variable related fixes and refactors](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-proactive-code-fixes/doc-assets/variableRelatedFixesVsCode.gif?raw=true?p=.gif)


<span id="arrow-functions-remove-and-add-body-braces"></span>
## Arrow Functions add / remove braces

(a quick way of getting the shorter expression of current arrow function and also add braces and parens to already shorted arrow functions)

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




and more to come!!



(TODO: if we add some vscode concrete UI implementations then we should put those demos here. But right now there is nothing vscode-particular implemented.)

## Extension Settings

No settings yet. 

## Known Issues

 * Please save the file before applying any refactor. In general they behave OK, but just in case it's good idea to save the ile first so there's no de synchronization. 
