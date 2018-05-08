# typescript-plugin-util

Utilities for developing TypeScript Language Server Plugins 

Install a Language Service Plugin easily:


# Easy plugin installation
 
 ```js
const serviceLanguageImplementation = { getApplicableRefactors, getEditsForRefactor }
export = pluginDefaultInitialize(pluginDefinition, (modules, info)=>{
  info.project.projectService.logger.info(`${PLUGIN_NAME} created!`) 
})
```

Instead of:
```js
function init(modules: { typescript: typeof ts_module }) {
  function create(anInfo: ts_module.server.PluginCreateInfo) {
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }
    proxy.getApplicableRefactors = getApplicableRefactors
    proxy.getEditsForRefactor = getEditsForRefactor
    return proxy
  }
  return { create }
}
export = init
```


# API docs

[See apidocs](../docs/typescript-plugins-util/modules/_index_.html)

# TODO

* build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!