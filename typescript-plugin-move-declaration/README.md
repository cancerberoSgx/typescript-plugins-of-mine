TypeScript plugin : A Refactor TypeScript plugin for moving exported declarations to another file. 

a.k.a : **move classes, functions, interfaces, etc to other files refactor**

** WIP - use at your own risk **

## Demo

## Features

 * Any top-level declaration can be moved from any file to an existing file of the same project
 * User interaction though the source file itself. Ugly: but allow being editor/IDE agnostic so at least this plugin
   supports Visual Studio Core and Atom editor (but other should also be supported too) 

## What's not supported yet

Important things not supported, yet:

 * only named import declarations supported: `import {a,b} from './foo'`
    * `import * as foo from 'foo'` not supported
    * `import bar from 'bar'` not supported  
