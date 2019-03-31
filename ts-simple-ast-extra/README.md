# ts-simple-ast-extra

extra utilities for ts-simple-ast that make sense on my plugins, like abstract types, test helpers, utilities, etc

while typescript-ast-util and typescript-plugin-util must remain independent on any library - this is very dependant on ts-simple-ast. 


# API docs

[See apidocs](../docs/typescript-plugins-util/modules/_index_.html)

# TODO

* build "Incremental build support using the language services" from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API so we can debug the whole experience in debugger instead of debugging using plugin manually in the editor!


<!-- 



    // /**
    //  * Removes all unused declarations like interfaces, classes, enums, functions, variables, parameters,
    //  * methods, properties, imports, etc. from all project's files unless `containers` parameter is given.
    //  * @param containers - Remove declarations only inside these Nodes.
    //  */
    // removeUnusedDeclarations(containers?: Node | Node[]): this {
    //     const context = {
    //         createSourceFile: (filePath: string, text?: string) => this._context.compilerFactory.createSourceFile(filePath, text || "", {markInProject: true}),
    //         getSourceFile: (filePath: string) => this._context.compilerFactory.getSourceFileFromCacheFromFilePath(filePath),
    //         getLanguageService: () => this
    //     };
    //     if (containers)
    //         ArrayUtils.asArray(containers).forEach(node => removeAllUnused(node, context));
    //     else {
    //         throw new Error("not implemented");
    //     }
    //     return this;
    // }


-->
