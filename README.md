Some experiments with typescript compiler, and Language Service plugins.

Note: this is a monorepo made with http://rushjs.io/


## testing sample-ts-plugin1

How to test plugins. For example, we have sample-ts-plugin1 and sample-ts-plugin1-sample-project

* `code sample-ts-plugin1-sample-project`
* because it has .vscode/settings.json -  "typescript.tsdk": "node_modules/typescript/lib"  it vscode should use typescript version from its node_modules
* just in case make sure of it going to "select typescript version" of the workspace. and reload vscode
* because tsconfig.json has `plugins` installing sample-ts-plugin1 that plugin should be loaded by tsserver. 
* select one identifier in the editor and you will see refactor suggestions. Also it wont autocomplete a.caller , only thissitheonlyautocompleted proeprty
* now make a change in the plugin, like changing the string "sebarefactiondesc", run "rush rebuild", restart ts server in vscode and that label should be shown as refactor suggestion label. 
* for debugging and seeing messages from plugin in tsserver exec: 
 `export TSS_LOG="-logToFile true -file `pwd`/tsserver_log.log -level verbose"`
