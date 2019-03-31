# ts-simple-ast-extra

extra utilities for ts-simple-ast that make sense on my plugins, like abstract types, test helpers, utilities, etc

while typescript-ast-util and typescript-plugin-util must remain independent on any library - this is very dependant on ts-simple-ast. 


# API docs

[See apidocs](../docs/typescript-plugins-util/modules/_index_.html)

# TODO

* build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!


<!-- 
> What about `LanguageService#removeUnusedDeclarations(containers?: Node | Node[]): this;`? (it would search all the descendants of the node(s) passed in or all the source files in the project).

I think it's better to have `LanguageService#removeUnusedDeclarations(filePathOrSourceFile: SourceFile | string): this;` since in general that's the signature of LanguageService methods. Then we can have, as you suggested: 

`SourceFile#removeUnusedDeclarations(containers?: Node | Node[]):this`
`Project#removeUnusedDeclarations(containers?: Node | Node[]):this`

Maybe in the case of Project `Project#removeUnusedDeclarations(excludeFiles?: SourceFile | string):this` is better.

The problem I'm currently having implementing `LanguageService#removeUnusedDeclarations(containers?: Node | Node[]): this;` is that, in case containers is undefined, I'm not sure how to obtain all project's source files (in general I don't know how to get the project from LanguageService and I doubt that is even possible . 

If you want to go this way, then I would need some help/tips with this. I can implement it copy/paste from `Project#getSourceFiles` but I would prefer you give me some hints first, or if it's possible to access a `Project`  from `LanguageService` method scope. Thanks -->
