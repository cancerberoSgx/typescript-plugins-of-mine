# typescript-plugins-text-based-user-interaction

**Helpers for TypeScript Language Service Plugins that wants to interact with the user via the source file itself**

 * If you are developing TypeScript plugins that require to interact with the user - but want to be portable, 
editor/IDE agnostic you can use this library to interact with the user via expressions in the source file
itself. 
 * default implementation for my plugins when need to inquire the user - not good looking but very powerful, portable, and cammon, here we are inquiring DEVELOPERS trying to refactor their source code, not Mickey Mouse! 
 * almost automatic implementation of a plugin from a config object
 * this way I can focus on implementing the plugin / refactor itself and have a working / flexible solution and leave the nice UI work to someone else or when I have time for that - now the real need is ts refactors!
 * just defining a config object it practically generates a working plugin that will suggest autocomplete "templates" and prompt user with function calls that he can modify and call refactors upon "to enter the data" (see demos and examples below)
 * right now very dependant on TypeScript Language Service API


# Demo

Moving and renaming a file in Visual studio Code Editor: 

 * ![Moving and renaming a file in Visual studio Code Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/vs-code-move-file.gif?raw=true?p=.gif)

Editor agnostic!. See the same demo but in Atom editor: 
 
 * ![Moving and renaming a file in Atom editor: Editor](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-move-file/doc-assets/atom-move-file.gif?raw=true?p=.gif)

* Another demo, this time inquiring two arguments:  ![Moving an interface to another file](https://raw.githubusercontent.com/cancerberoSgx/typescript-plugins-of-mine/master/typescript-plugin-move-declaration/doc-assets/vscode-move-interface.gif)



## Ideas

 * we have many ideas on how the interaction could be right now is like that, with a free-signature function call - so user can model it at piaccere.
 But this could be improved - for example, instead of a function call, user could be promopted like in a form and we could json-schema validate / hint/autocomplete/etc. 
 * Probably the best idea would be maintaining the protocol visual-metaphor-agnostic (perhaps json-schema is a good idea) and then implement different metaphor that user can choose to use by config and others contribute with new ones. 

## TODO: 

 * documentation, examples
 * Big TODO: Language server protocol instead just TLS. implement this 100% there and you have plugins that will work on any ed. 
 * also related to previous - could we be language (ts) agnostic and provide the same capability to any LSP enable language  not only to TS ? 


# Example

The following example are fragments of [reorder signature parameters plugin](https://github.com/cancerberoSgx/typescript-plugins-of-mine/blob/master/typescript-plugin-function-signature-refactors/src/index.ts). This plugin objective is to change the order of parameters on a given function signature or call. We need to know from the user, interactively, what's the function he want's to change its signature and how the parameters will be re-ordered in the signature. See the gif (TODO) for how the experience is.
Basically the user can create a "snippet" of an special function call, modify the call (entering the data) and then applying  a refactor to let us know the input. 
```ts
// here we import the text-based-ui tool
import { Action, create } from 'typescript-plugins-text-based-user-interaction';
import * as ts from 'typescript';
import { getPluginCreate, LanguageServiceOptionals, createSimpleASTProject } from 'typescript-plugin-util';
import { SourceFile, TypeGuards, SignaturedDeclaration, NamedNode, Node } from 'ts-simple-ast';
import { reorderParameters } from './reorderParams';

const PLUGIN_NAME = 'typescript-plugin-function-signature-refactors'
const REFACTOR_ACTION_NAME = `${PLUGIN_NAME}-refactor-action`

// here we create the tool providing a configuration object that define "actions". In this case a simple one
const interactionTool = create({
  actions: [
    {

      // these are the names of the parameters user wil have to modify in function call `reorderParams()`. After user apply the final 
      // refactor calling  interactionTool.getApplicableRefactors or tool.findActions(sourceFile.getText()) will generate this object
      args: ['name', 'reorder'],

      // dynamically create the text for function call `reorderParams()` snippet that user will need to modify. In this case we want 
      // to print the closest function-like name in the ASt to the current user's position and a comment with help
      snippet: (fileName: string, position: number): string | undefined => {
        let func = lookForClosestFunction(fileName, position)
        if (!func || func.parameters && func.parameters.length <= 1) {
          return
        }
        const reorder = []
        for (let i = 0; i < func.parameters.length; i++) {
          reorder.push(func.parameters.length - i - 1)
        }
        return `reorderParams("${func.name.getText()}", [${reorder.join(', ')}])
/* Help: The second argument is the new order of parameters. \`param[N] === M\` means move the Nth parameter to the Mth position. 
For example, \`[2, 3]\` means put the first parameter in the third (2) place and the second parameter in the fourth (3) place. 
Other parameters will adjust their positions to comply with this, for example, the third parameter will move to the first place and so on. */`
      },

      // a special prefix our comments will start with so we can differentiate them from others and suggest our special 
      // refactors when the user is there. 
      prefix: '&%&%',
      
      // we are able to enrich the autocomplete suggestions with extra text
      nameExtra: (fileName: string, position: number) => {
        const func = getFunction(fileName, position)
        return func ? `of ${func.name.getText()}` : ''
      },
      // the message in the final refactor suggestion
      print: action => `Reorder parameters of "${action.args.name}"`,
    }
  ]
})

let selectedAction:Action
// we delegate all the work in interactionTool.getApplicableRefactors - will take care of displaying refactor suggestions if the user is standing in a speciall comment marked with the special preffix 
function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts.UserPreferences):  ts.ApplicableRefactorInfo[] {
  const result = interactionTool.getApplicableRefactors(info, `${PLUGIN_NAME}-refactor`, REFACTOR_ACTION_NAME, fileName, positionOrRange, userPreferences)
  selectedAction =  result.selectedAction // This was the action selected by the user using autosuggestions
  return result.refactors
}

// we delegate most of the work to info.languageService.getEditsForRefactor. At this point user input is available in 
// selectedAction.args.name and selectedAction.args.reorder which we use to implement the actual refactor (implementation not relevant)
function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts_module.TextRange, refactorName: string, actionName: string, userPreferences: ts_module.UserPreferences): ts.RefactorEditInfo | undefined {
  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName, userPreferences)
  if (actionName !== REFACTOR_ACTION_NAME) {
    return refactors
  }
  const targetFunctionDeclaration = getTargetFunction(sourceFile, positionOrRangeToNumber(positionOrRange), selectedAction.args.name)
  reorderParameters(targetFunctionDeclaration, selectedAction.args.reorder) 
}

// autocompletions! notice how I delegate the work on the tool interactionTool.getCompletionsAtPosition()
function getCompletionsAtPosition(fileName: string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options)
  if (prior) {
    prior.entries = prior.entries.concat(interactionTool.getCompletionsAtPosition(fileName, position, options))
  }
  return prior
}


// our plugin definition and registration (using typescript-plugin-util)
let info: ts_module.server.PluginCreateInfo
const pluginDefinition: LanguageServiceOptionals = {
  getApplicableRefactors, getEditsForRefactor, getCompletionsAtPosition
}
export = getPluginCreate(pluginDefinition, (modules, anInfo) => {
  info = anInfo
})

```




# Example (old one)

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
  // now we can implement the refactor since we have input information from the user in selectedAction.args - 
  // particularly in this example args.dest - the path where the user want's to move the file or folder
  // whe user apply the refactor this object is automatically feeded with this input in args prop
  // ....
}

// We also ask the tool for completions at position so when user starts writing "refactor" it will be offered with snippets defined in the config for each type of action
function getCompletionsAtPosition (fileName:string, position: number, options: ts_module.GetCompletionsAtPositionOptions | undefined): ts_module.CompletionInfo {
  const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
  prior.entries = prior.entries.concat(tool.getCompletionsAtPosition(fileName,position, options))
  return prior;
};

```


# TODO / Roadmap 

 * 


# Changelog

 
## 0.0.5 

 * support for multi-line action declarations. 
 * support for dinamic autocomplete suggestions

