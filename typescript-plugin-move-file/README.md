# TypeScript plugin for moving files or folders

 * Move/rename a file or folder fixing all imports to point to the new location in all the TypeScript project
 * Based on [ts-simple-ast])(https://dsherret.github.io/ts-simple-ast) file and directory move() operation
 * Editor / IDE agnostic - it shoul dwork on any editor that supports TypeScript Language Plugins. Uses
   [typescript-plugins-text-based-user-interaction](https://github.com/cancerberoSgx/typescript-plugins-of-mine/tree/master/typescript-plugins-text-based-user-interaction)
   for interacting with the user via the source file itself. 

# Demos

Moving and renaming a file in Visual studio Code Editor: 
 * ![Moving and renaming a file in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif)

Editor agnostic!. See the same demo but in Atom editor: 
 
 * ![Moving and renaming a file in Atom 
   Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-extract-move-file/doc-assets/atom-move-file.gif?raw=true?p=.gif)

# TODO
 * notify last error - adding a comment just below the &%&% comment that failed
 * option to undo-last-action