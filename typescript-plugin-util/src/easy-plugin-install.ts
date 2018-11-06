import * as ts_module from 'typescript/lib/tsserverlibrary'
import { LanguageService } from 'typescript';
import { LanguageServiceOptionals } from './LanguageServiceOptionals';


export function initReturnTypeSignature(modules: { typescript: typeof ts_module }): { create: (info: ts_module.server.PluginCreateInfo) => ts.LanguageService } {
  return undefined as any
}
/**
 * SCreates the `create` function - handles only that part
 * @param languageService Object like LanguageService but with optional keys. Basically your plugin implementation. The type should be LanguageService, but can't because properties are all optional
 * @param onCreate callback when `create` is called
 */
export function pluginCreateCreate(languageService: LanguageServiceOptionals,
  onCreate: (info: ts_module.server.PluginCreateInfo) => undefined)
  : (info: ts_module.server.PluginCreateInfo) => ts.LanguageService {

  return function create(info: ts_module.server.PluginCreateInfo): ts.LanguageService {
    onCreate(info)
    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }
    for (let i in languageService) {
      (proxy as any)[i] = (languageService as any)[i]
    }
    return proxy
  }
}


/**
 * Similar to [[getPluginCreate]] but more verbose, with two separated callbacks
 * @param languageService Object like LanguageService but with optional keys. Basically your plugin implementation. The type should be LanguageService, but can't because properties are all optional
 * @param onInit called when `init` is called
 * @param onCreate callback when `create` is called
 * @return the {create} object ready to be exported as it is
 */
export function pluginCreateInit(languageService: LanguageServiceOptionals,
  onInit: (modules: { typescript: typeof ts_module }) => undefined,
  onCreate: (info: ts_module.server.PluginCreateInfo) => undefined)
  : (typeof initReturnTypeSignature) {

  return function init(modules: { typescript: typeof ts_module }) {
    onInit(modules)
    const create = pluginCreateCreate(languageService, (anInfo) => {
      onCreate(anInfo)
      return undefined
    })
    return { create }
  }
}

/**
 * Easier way of installing a plugin, example of exporting the {create} object: 
 * 
 * ```js
 * // my plugin only define some refactor suggestions this is it: 
 * const pluginDefinition = { getApplicableRefactors, getEditsForRefactor }
 * // export the {create} function with just one call, let the library take care of init the proxy and callbacks
 * export = pluginDefaultInitialize(pluginDefinition, (modules, info_)=>{
 *   info = info_ // you probably want to make `info` available to the rest of your plugin impl.
 *   info.project.projectService.logger.info(`${PLUGIN_NAME} created!`) 
 * })
 * ```
 * @param languageService Object like LanguageService but with optional keys. Basically your plugin implementation. The type should be LanguageService, but can't because properties are all optional
 * @param cb called when both init and create are done. your plugin was installed successfully
 * @return the {create} object ready to be exported as it is
 */
export  function getPluginCreate(languageService:LanguageServiceOptionals, cb: (modules: { typescript: typeof ts_module }, info: ts_module.server.PluginCreateInfo)=>void):(typeof initReturnTypeSignature){
  let modules: { typescript: typeof ts_module }
  return  pluginCreateInit(languageService, modules_=>{
      modules = modules_
      return undefined
    },
    (info: ts_module.server.PluginCreateInfo) => {
      cb(modules, info)
      return undefined
    })
}





// export = pluginCreateInit(pluginDefinition, 
//   (modules: { typescript: typeof ts_module }): undefined => {
//     ts = modules.typescript
//     return
//   },
//   (anInfo) => {
//     info = anInfo
//     info.project.projectService.logger.info(`${PLUGIN_NAME} created`)
//     return undefined
//   })

// interface PluginDefaultInitializeHandler{modules: { typescript: typeof ts_module }, info: ts_module.server.PluginCreateInfo}
// /*{promise: Promise <PluginDefaultInitializeHandler>, create: (typeof initReturnTypeSignature)}*/
