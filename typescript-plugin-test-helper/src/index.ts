
import {
  LanguageService, ScriptSnapshot, getDefaultLibFilePath, DocumentRegistry, LanguageServiceHost, MapLike,
  sys, createDocumentRegistry, createLanguageService, CompilerOptions
} from 'typescript';
import { existsSync, readFileSync, writeFileSync, watchFile } from 'fs';
import { EventEmitter } from 'events';

export class Tool extends EventEmitter {

  private rootFileNames: string[];
  private files: MapLike<{ version: number }> = {}
  private servicesHost: LanguageServiceHost
  private documentRegistry: DocumentRegistry
  private services: LanguageService

  private constructor(private config: ToolConfig) {
    super()
    this.rootFileNames = this.config.rootFileNames
    this.config.rootFileNames.forEach(fileName => {
      this.files[fileName] = { version: 0 }
    })
    // Create the language service host to allow the LS to communicate with the host
    this.servicesHost = {
      getScriptFileNames: () => this.config.rootFileNames,
      getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
      getScriptSnapshot: (fileName) => {
        if (!existsSync(fileName)) {
          return undefined;
        }
        return ScriptSnapshot.fromString(readFileSync(fileName).toString());
      },
      getCurrentDirectory: () => this.config.currentDirectory || process.cwd(),
      getCompilationSettings: () => this.config.options,
      getDefaultLibFileName: (options) => getDefaultLibFilePath(options),
      fileExists: sys.fileExists,
      readFile: sys.readFile,
      readDirectory: sys.readDirectory,
    }
    // Create the language service files
    this.documentRegistry = createDocumentRegistry()
    this.services = createLanguageService(this.servicesHost, this.documentRegistry)
  }

  emitAllFiles(options: EmitFileOptions ) {
    this.config.rootFileNames.forEach(fileName => {
      this.emitFile(fileName, options);
    })
  }
  /**
   * @param fileName 
   * @param updateVersion  Update the version to signal a change in the file
   */
  emitFile(fileName: string, options: EmitFileOptions): void {
    if (options.updateVersion) {
      this.files[fileName].version++;
    }
    let output = this.services.getEmitOutput(fileName);
    this.emit('emit-file-output', output)
    if (!output.emitSkipped) {
      this.emit('emit-file-success', fileName)
    }
    else {
      this.emit('emit-file-error', fileName) //when emitted users can get errors using: this.getServices().getCompilerOptionsDiagnostics()
    }
    output.outputFiles.forEach(o => {
      if (this.config.writeEmitOutputFile) {
        writeFileSync(o.name, o.text, "utf8");
      }
    });
  }

  public static create(config: ToolConfig) {
    const tool = new Tool(config)
    return tool
  }

  public watch(options: WatchOptions) {
    this.rootFileNames.forEach(fileName => {
      watchFile(fileName,options,
        (curr, prev) => {
          // Check timestamp
          if (+curr.mtime <= +prev.mtime) {
            return;
          }
          // write the changes to disk
          this.emitFile(fileName, options.emitOptions);
        });
    })
  }
}

export const create = Tool.create

export class EmitFileOptions{
  updateVersion: boolean = true
}
export class WatchOptions{
  emitOptions?: EmitFileOptions = new EmitFileOptions()
  persistent?: boolean = true
  interval?: number = 250
}

export interface ToolConfig {
  rootFileNames: string[],
  options: CompilerOptions,
  currentDirectory?: string
  tsconfig?: string // not supported yet create({tsconfig: 'path/to/tsconfig.json'})
  writeEmitOutputFile?: boolean
} 