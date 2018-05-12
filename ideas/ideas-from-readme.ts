
## plugin ideas

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
* super idea: create interactive UI only with typescript and refactors ? user interact directly with typescript by editing files and selecting refactors (and other maybe?)  something like inquierer with codes in the txt ? nice thing is plugin authors dont need waste time in learning editor specific technologies and will work in all - more on ideas/ts-inquirer.md
