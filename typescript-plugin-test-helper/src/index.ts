
import { EventEmitter } from 'events';
import { existsSync, readFileSync, watchFile, writeFileSync } from 'fs';
import { sync as glob } from 'glob';
import { CompilerOptions, DocumentRegistry, LanguageService, LanguageServiceHost, MapLike, ModuleKind, ScriptSnapshot, createDocumentRegistry, createLanguageService, getDefaultLibFilePath, sys } from 'typescript';

export class Tool extends EventEmitter {

  private inputFiles: string[];
  private files: MapLike<{ version: number }> = {}
  private servicesHost: LanguageServiceHost
  private documentRegistry: DocumentRegistry
  private services: LanguageService

  private constructor(private config: ToolConfig) {
    super()
    config.options = config.options || { module: ModuleKind.CommonJS }
    config.options.module = config.options.module || ModuleKind.CommonJS

    this.inputFiles = typeof this.config.inputFiles === 'string' ? glob(this.config.inputFiles) : this.config.inputFiles
    this.inputFiles.forEach(fileName => {
      this.files[fileName] = { version: 0 }
    })
    const self = this
    // Create the language service host to allow the LS to communicate with the host
    this.servicesHost = {
      getScriptFileNames: () => this.inputFiles,
      getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
      getScriptSnapshot: (fileName) => {
        // console.log('getScriptSnapshot', fileName)
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
      log: (m) => self.emit('log', m)
      ,error: m=>self.emit('error', m),
      // realpath: process.cwd(),
      installPackage: (options)=>{console.log('installPackage', options); return Promise.resolve({successMessage: 'successMessage'})}
    }
    // Create the language service files
    this.documentRegistry = createDocumentRegistry()

    this.services = createLanguageService(this.servicesHost, this.documentRegistry)
  }

  emitAllFiles(options: EmitFileOptions = new EmitFileOptions()) {
    this.inputFiles.forEach(fileName => {
      this.emitFile(fileName, options);
    })
  }
  /**
   * @param fileName 
   * @param updateVersion  Update the version to signal a change in the file
   */
  emitFile(fileName: string, options: EmitFileOptions = new EmitFileOptions()): void {
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

  public watch(options: WatchOptions = new WatchOptions()) {
    // this.emitAllFiles(options.emitOptions)
    this.inputFiles.forEach(fileName => {
      this.emitFile(fileName, options.emitOptions)
      // console.log('watchFile(fileName,', fileName, options);      
      watchFile(fileName, { persistent: true, interval: 250 }/*options */, (curr, prev) => {
        // Check timestamp
        if (+curr.mtime <= +prev.mtime) {
          return;
        }
        // write the changes to disk
        this.emitFile(fileName, options.emitOptions);
      });
    })
  }

  getLanguageService(): LanguageService {
    return this.services
  }
  getLanguageServiceHost(): LanguageServiceHost {
    return this.servicesHost
  }
}

export const create = Tool.create

export class EmitFileOptions {
  /** Update the version to signal a change in the file */
  updateVersion: boolean = true
}
export class WatchOptions {
  emitOptions: EmitFileOptions = new EmitFileOptions()
  persistent: boolean = true
  interval: number = 250
}

export interface ToolConfig {
  /** if array it will be considered as literal paths, if string it will be evaluated as glob */
  inputFiles: string[] | string,
  options?: CompilerOptions,
  currentDirectory?: string
  tsconfig?: string // not supported yet create({tsconfig: 'path/to/tsconfig.json'})
  writeEmitOutputFile?: boolean
} 