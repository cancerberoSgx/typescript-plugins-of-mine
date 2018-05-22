import * as fs from "fs";
import ts from "typescript";
import tsserver from "typescript/lib/tsserverlibrary";
import { ScriptKind } from "typescript";

function watch(rootFileNames: string[], options: ts.CompilerOptions) {
    const files: ts.MapLike<{ version: number }> = {};

    // initialize the list of files
    rootFileNames.forEach(fileName => {
        files[fileName] = { version: 0 };
    });

    // Create the language service host to allow the LS to communicate with the host
    const servicesHost: ts.LanguageServiceHost = {
        getScriptFileNames: () => rootFileNames,
        getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
        getScriptSnapshot: (fileName) => {
            if (!fs.existsSync(fileName)) {
                return undefined;
            }

            return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
        },
        getCurrentDirectory: () => process.cwd(),
        getCompilationSettings: () => options,
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
    };

    
    // Create the language service files
    const registry = ts.createDocumentRegistry()
    const services = ts.createLanguageService(servicesHost, registry)

    // Now let's watch the files
    rootFileNames.forEach(fileName => {
        // First time around, emit all files
        emitFile(fileName);

        // Add a watch on the file to handle next change
        fs.watchFile(fileName,
            { persistent: true, interval: 250 },
            (curr, prev) => {
                // Check timestamp
                if (+curr.mtime <= +prev.mtime) {
                    return;
                }

                // Update the version to signal a change in the file
                files[fileName].version++;

                // write the changes to disk
                emitFile(fileName);
            });
    });   

    function emitFile(fileName: string) {

      
        // console.log(services.getProgram().getSourceFiles().map(f=>f.fileName))

        // ts v 3: 
        // const refs = services.getApplicableRefactors('src/fruit.ts', {pos: 0, end: 26}, {allowTextChangesInNewFiles: true}) 
        // const edits = services.getEditsForRefactor('src/fruit.ts', {}, {pos: 0, end: 26}, 'Move to a new file', 'Move to a new file', {allowTextChangesInNewFiles: true})

        const refs = services.getApplicableRefactors('src/fruit.ts', {pos: 0, end: 26}) 
        const edits = services.getEditsForRefactor('src/fruit.ts', {}, {pos: 0, end: 26}, 'Move to a new file', 'Move to a new file')


        console.log(JSON.stringify(edits, null, 2))  

        services.applyCodeActionCommand(edits!)


        // edits!.edits.forEach(edit=>{
        //   if(!edit.isNewFile){
        //     edit.textChanges.forEach(tc=>{
        //       const sourceFile = services.getProgram().getSourceFile(edit.fileName)
        //       services.getProgram().sn
        //       // oldText.length - textChangeRange.span.length + textChangeRange.newLength === newText.length
        //       // textChangeRange.newLength  = newText.length-oldText.length+textChangeRange.span.length

        //       tc.span.length++
        //       const newLength = Math.max(0, tc.newText.length-sourceFile!.getText().length + tc.span.length) 
        //       console.log("update info for ", edit.fileName, "newLength: ", newLength, "tc.newText.length", tc.newText.length, "sourceFile!.getText().length",  sourceFile!.getText().length,  "tc.span.length",  tc.span.length, "content", sourceFile!.getText() )
        //       sourceFile!.update(tc.newText, {...{span: tc.span}, newLength: newLength});
        //       console.log("updated ", sourceFile!.getText());
        //       services.getEmitOutput(edit.fileName)
        //     })
        //   }else{
        //     const newFile = ts.createSourceFile(edit.fileName, edit.textChanges[0].newText, ts.ScriptTarget.ES2018,  true, ts.ScriptKind.TS)
        //     console.log("created ", newFile!.getText());
        //     services.getEmitOutput(edit.fileName)
        //   }
        // })

        // console.log('finish', services.getProgram().getSourceFile('src/model/apple.ts')!.getText())




        let output = services.getEmitOutput(fileName);
        if (!output.emitSkipped) {
            console.log(`Emitting ${fileName}`);
        }
        else {
            console.log(`Emitting ${fileName} failed`);
            logErrors(fileName);
        }

        output.outputFiles.forEach(o => {
            fs.writeFileSync(o.name, o.text, "utf8");
        });
    }

    function logErrors(fileName: string) {
        let allDiagnostics = services.getCompilerOptionsDiagnostics()
            .concat(services.getSyntacticDiagnostics(fileName))
            .concat(services.getSemanticDiagnostics(fileName));

        allDiagnostics.forEach(diagnostic => {
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            if (diagnostic.file) {
                let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                console.log(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.log(`  Error: ${message}`);
            }
        });
    }
}

// Initialize files constituting the program as all .ts files in the current directory
// const inputFiles: string[] = []

// fs.readdirSync('./src').
//     filter(fileName => fileName.length >= 3 && fileName.substr(fileName.length - 3, 3) === ".ts").forEach(f=>inputFiles.push(f))

// fs.readdirSync('./src/model').
//   filter(fileName => fileName.length >= 3 && fileName.substr(fileName.length - 3, 3) === ".ts").forEach(f=>inputFiles.push(f))

    
// Start the watcher
import {sync as glob} from 'glob'
const inputFiles = glob('src/**/*.ts')

console.log(inputFiles)
watch(inputFiles, { module: ts.ModuleKind.CommonJS });