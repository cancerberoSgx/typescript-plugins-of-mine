# typescript-plugins-text-based-user-interaction

**Helpers for TypeScript Language Service Plugins that wants to interact with the user via the source file itself**

If you are developing TypeScript plugins that require to interact with the user - but want to be 
editor/IDE agnostic you can use this library to interact with the user via expressions in the source file
itself. 

# Demo

Moving and renaming a file in Visual studio Code Editor: 

 * ![Moving and renaming a file in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif)

Editor agnostic!. See the same demo but in Atom editor: 
 
 * ![Moving and renaming a file in Atom editor: 

   Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/atom-move-file.gif?raw=true?p=.gif)

* Another demo, this time inquiring two arguments:  ![Moving an interface to another file](https://raw.githubusercontent.com/cancerberoSgx/typescript-plugins-of-mine/master/typescript-plugin-move-declaration/doc-assets/vscode-move-interface.gif)

## Great idea just came up to my mind: 

example for move member . user select a method, a refactor is suggested "cut method foo()". user goes to other file and select a class identifier. a refactor is suggested "paste method foo()". result. method decl is moves from first class other second one (and all its references are updated across the project.)
if what the user needs is to "select" 1 or more (more than two even) c¿objects from the AST this works
Cons: ust do it in order, and kind of visually. Could be as an alternative to main idea - and this package can implement it. 

## Big TODO: 

 * Language server protocol. implement this 100% there and you have plugins that will work on any ed. 


# Example

The following is a fragment of typescript-plugin-move-file typescript plugin  which uses this library to ask the user where to
move current file or current directory: 

The functions `getApplicableRefactors`, `getEditsForRefactor`, `getCompletionsAtPosition` are the ones to be added in the TypeScript Language Service Plugin proxy object. See https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin for more info about
typescript plugins. 

```typescript
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
const PLUGIN_NAME = 'typescript-plugin-move-file'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

// tool creation. 
const tool = create({
  prefix: '&%&%',
  actions: [
    {
      name: 'moveThisFileTo',
      args: ['dest'],
      print: (action) => `Move this file to ${action.args.dest}`,
      snippet: 'moveThisFileTo(\'../newName.ts\')'
    },
    {
      name: 'moveThisFolderTo',
      args: ['dest'],
      print: (action) =>`Move this folder to ${action.args.dest}`,
      snippet: 'moveThisFileTo(\'../newName\')'
    }
  ]
})

let selectedAction: Action

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts.ApplicableRefactorInfo[] {
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []
  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  // we ask the tool to search in current file text if there are any expressions like ` // &%&% moveThisFileTo(...)` or `// &%&% moveThisFolderTo(..)`
  const actions = tool.findActions(sourceFile.getText())
  if (!actions || actions.length === 0) {
    return refactors
  }
  selectedAction = actions[0]
  // selectedAction is the action defined by the user, for example, selectedAction.args.dest is the 
  // destination file specified by the user in a comment like: 
  // `// &%&% moveThisFileTo('../units/Warrior.ts') `. 
  // In the next statement, we use selectedAction.print to print a description of the action 
  // (provided by the user in the config): 
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'move-file-action',
    actions: [{ 
      name: REFACTOR_ACTION_NAME + '-' + selectedAction.name, 
      description: selectedAction.print(selectedAction) 
    }]
  })
  return refactors
}

function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string): ts.RefactorEditInfo | undefined {
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)
  if (!actionName.startsWith(REFACTOR_ACTION_NAME) || !selectedAction) {
    return refactors
  }
  // now we can implement the refactor since we have input information from the user in selectedAction.args - particularly in this example args.dest - the path where the user want's to move the file or folder
  // ....
}

// We also ask the tool for completions at position so when user starts writing "refactor" it will be offered with snippets defined in the config for each type of action
function getCompletionsAtPosition (fileName:string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
  prior.entries = prior.entries.concat(tool.getCompletionsAtPosition(fileName,position, options))
  return prior;
};

```
