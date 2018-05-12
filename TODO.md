
## TODO

 * build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!
 Because of performance, should I pack all these plugins in a single plugin so e request the AST / lang service minimally ?
  * remove all gif from this readme only put a couple of simple light images - leave gifs in they own readmes
  
  
  
  
  
  
  
  
  
  Hello, I'm just starting with Language Service Plugins and made some like extract interface, add inferred types, show all sub/super/class/interface recursively, print AST, add inferred type to declaration. Also a tutorial for beginners since it cost me to get started: https://github.com/cancerberoSgx/typescript-plugins-of-mine 

I plan to keep working and develop more complex refactors like move member to other class, move class to another file, support mono-repos, etc. I suspect that somebody else should already done this but I search a lot didn't found plugins like these. DO you know about if such a thing as  a typescript plugin marketplace / collection / tag / central exists ?

Sincerely I'm surprised about two things: with such a great tool/framework, how is it that owners didn't implemented more advanced refactor tools ? Perhaps the idea is that comunity (IDEs owners) take care of that, but in that case, why is the API documentation almost nonexistent? Am I missing something here? DO you know if compiler / service API are on the roadmap ? Is because the compiler / server API is not mature enough ? How can I help ?

Thanks sorry for the long text



https://stackoverflow.com/users/1704166/ryan-cavanaugh
https://github.com/Microsoft/TypeScript/tree/master/src/services/codefixes



    "postinstall": "rush generate && rush install && rush link && npm run link-missing-modules && rush build ",
    "link-missing-modules": "ln-cli sample-ts-plugin1 --force --path common/temp/node_modules && ln-cli typescript-plugin-extract-interface --force --path common/temp/node_modules && ln-cli typescript-plugin-subclasses-of --force --path common/temp/node_modules && ln-cli typescript-ast-util --force --path common/temp/node_modules && ln-cli typescript-plugin-ast-inspector --force --path common/temp/node_modules && ln-cli typescript-plugin-add-type --force --path common/temp/node_modules",