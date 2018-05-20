
## TODO
  
 * build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!
 Because of performance, should I pack all these plugins in a single plugin so e request the AST / lang service minimally ?
  
  
 ## DOUBTS:


  * remove all gif from this readme only put a couple of simple light images - leave gifs in they own readmes
  
  
  
## plugin ideas
* a plugin like move-declaration but for commons.js
* a plugin like move-file but for commons.js
* a plugin that changes expressions like cond1 && cond2 || !cond3 to its equivalent : (!cond1 || !cond2) && cond3 - useless and hard
* move method to other class (complicated - move interfaces also or classes hierarchy!)
* move node (class, interf, function to other file) - complication: exported nodes! must change other's imports
* add explicit type: select an identifier without explicit type - a refactor add its type based on the inferred one. 
* when adding an extra parameter to a function call a refactor should allow me to add this new parameter to the function/method declaration automatically
* method delegation to a property member
* show the ast tree (simplified) of current keyword (DONE!)
* show all subclasses of current class/interface - show all implementors off current interface. 
* go to definition / goto implementation hierarchy
* views that shows the content of large. hierarchynode.d.ts, tsserverlibrary.d.ts, etc a more tree-view like for examine the structure and search
* yeoman generator for ts plugins ? 
* return type not compatible with actual hierarchyfix declared return type

// IDEA ast-inspector enhancement : other action that prints nodeAtCursor.arent.parent.arent to the top so I know where I'm standings
  
  
  
  
## MISC 


https://stackoverflow.com/users/1704166/ryan-cavanaugh
https://github.com/Microsoft/TypeScript/tree/master/src/services/codefixes



    "postinstall": "rush generate && rush install && rush link && npm run link-missing-modules && rush build ",
    "link-missing-modules": "ln-cli sample-ts-plugin1 --force --path common/temp/node_modules && ln-cli typescript-plugin-extract-interface --force --path common/temp/node_modules && ln-cli typescript-plugin-subclasses-of --force --path common/temp/node_modules && ln-cli typescript-ast-util --force --path common/temp/node_modules && ln-cli typescript-plugin-ast-inspector --force --path common/temp/node_modules && ln-cli typescript-plugin-add-type --force --path common/temp/node_modules",