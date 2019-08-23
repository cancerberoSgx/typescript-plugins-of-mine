
# TODO
-[ ] test against pure JS (no tsconfig.json) projects
-[ ] browser tests
-[ ] use ts-morph extract interface refactor instead ours
-[ ] move the project to its own repo - change its name to something more meanful related to refactors. 
  -[ ] Command line Application ? separate project ? 
-[x] use ts-refactor instead prettier.
-[x] refactor/organizeImports
-[x] refactor format: provide string level APIs
-[x] format refactors: Option to check for compile errors.
-[x] refactor convertParamsToDestructuredObjectSpec
-[x] refactor formatJsdoc
-[x] refactor emptyLines

## Ideas

* build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!


* INVESTIGATE THIS TO MOVE CLASSES:
https://basarat.gitbooks.io/typescript/docs/types/moving-types.html
Copying both the Type + Value
If you want to move a class around, you might be tempted to do the following:
class Foo { }
var Bar = Foo;
var bar: Bar; // ERROR: cannot find name 'Bar'
This is an error because var only copied the Foo into the variable declaration space and you therefore cannot use Bar as a type annotation. The proper way is to use the import keyword. Note that you can only use the import keyword in such a way if you are using namespaces or modules (more on these later):
namespace importing {
    export class Foo { }
}

import Bar = importing.Foo;
var bar: Bar; // Okay
This import trick only works for things that are both type and variable.