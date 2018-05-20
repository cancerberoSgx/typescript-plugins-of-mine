# typescript-plugins-text-based-user-interaction

**Helpers for TypeScript Language Service Plugins that wants to interact with the user via the source file itself*

If you are developing TypeScript plugins that require to interact with the user - but want to be 
editor/IDE agnostic you can use this library to interact with the user via expressions in the source file
itself. 

# Example

The following is a fragment of typescript-plugin-move-file typescript plugin  which uses this library to ask the user where to
move current file or current directory: 

Functions `getApplicableRefactors`, `getEditsForRefactor`, `getCompletionsAtPosition` are the ones we need ot insert
in plugin proxy object. See https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin for more info about
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
  // selectedAction is the action defined by the user, for example, selectedAction.args.dest is the destination file specified by the user in a comment like `  // &%&% moveThisFileTo('../units/Warrior.ts') `. More, in the next statement, we use selectedAction.print to print a description of the action (provided by the user in the config): 
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
