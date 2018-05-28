import { CodeFix, CodeFixNodeOptions, CodeFixFileOptions, CodeFixProjectOptions } from "./typings";
import { TextRange, ScriptSnapshot, IScriptSnapshot, Diagnostic } from "typescript";
// import { Diagnostic } from "ts-simple-ast";
import * as ts_module from 'typescript/lib/tsserverlibrary';
import * as ts from 'typescript';
import { createSimpleASTProject } from "typescript-plugin-util";
import { SourceFile } from "ts-simple-ast";
// this one exec first so it calculate, caches and provide common data and operations to others (performance). Must be installed the first.
// const Project = tss.server.Project

interface CacheEntry extends CodeFixFileOptions {
  snapshot: IScriptSnapshot
}
export class Common implements CodeFix {
  // lastPredicateOptions: CodeFixNodeOptions;
  // needSimpleAst?: boolean = true;
  // predicateArgs: CodeFixNodeOptions;
  name: string = 'common_utilities'
  config = {}

  // private fileSnapshots: {
  //   [key:string]: IScriptSnapshot
  // } = {}

  private projectOptions: CodeFixProjectOptions

  private cache: { [fileName: string]: CacheEntry } = {}

  predicate(opts: CodeFixNodeOptions): boolean {
    // this.lastPredicateOptions = opts // we dont want to take any time on predicate
    // if(this.isFileChanged(opts.fileName, opts.project)){
    // this.cleanCache(opts.fileName)
    // this.cache[opts.fileName] = undefined
    // }
    return false;
  }

  description(opts: CodeFixNodeOptions): string { return `commonchangerange?` }

  apply(opts: CodeFixNodeOptions): ts.ApplicableRefactorInfo[] | void {
    return undefined
  }

  // project?: ts_module.server.Project,
  public init(project: ts_module.server.Project, log: (str: string) => void) {
    if (!this.projectOptions) {
      const program = project.getLanguageService().getProgram()
      const simpleProject = null//createSimpleASTProject(project)
      this.projectOptions = {
        program, project, simpleProject, log
      }
    }
  }
  public initSimpleAstProject(fileName:string): CodeFixFileOptions {
    // const program = this.projectOptions.project.getLanguageService().getProgram()
    this.projectOptions.simpleProject = createSimpleASTProject(this.projectOptions .project)
    const result= this.getOptionsFor(fileName)
    result.simpleSourceFile =   this.projectOptions.simpleProject.getSourceFile(fileName) 
    return result
  }
  public getOptionsFor(fileName: string ): CodeFixFileOptions {
    // if not in cache create new entry and return
    if (!this.cache[fileName]) {
      const sourceFile = this.projectOptions.program.getSourceFile(fileName)
      this.cache[fileName] = {
        ...this.projectOptions,
        fileName,
        sourceFile,
        simpleSourceFile: null,
        snapshot: null,//this.projectOptions.project.getScriptSnapshot(fileName),
        diagnostics: []//ts_module.getPreEmitDiagnostics(this.projectOptions.program, sourceFile)
      }
      return this.cache[fileName]
    }
    this.cache[fileName].simpleSourceFile= this.cache[fileName].simpleSourceFile//this.projectOptions.simpleProject.getSourceFile(fileName)


    // if in cache compare snapshots if change replace snapshot and diagnostic and update simpleFile from fs
    // const newSnapshot = this.projectOptions.project.getScriptSnapshot(fileName)
    // const change = newSnapshot.getChangeRange(this.cache[fileName].snapshot)
    // if(!change){
      // this.cache[fileName].log(`getOptionsFor file ${fileName} WARNING change undefined - updating snapshot`)
      // this.cache[fileName].snapshot = newSnapshot
    // }
    // let contentChanged = change ? (change.span.start || change.span.length || change.newLength) : true
    // if(change){
    //   contentChanged = change.span.start || change.span.length || change.newLength
    // }
    // const contentChanged = change.span.start || change.span.length || change.newLength

    // this.cache[fileName].log(`getOptionsFor file ${fileName}  content changed ${JSON.stringify(change)} updating cache item. ${!change+' WARNING change undefined '}`)
    // if (contentChanged) { 
      // this.cache[fileName].snapshot = newSnapshot
      // this.cache[fileName].simpleSourceFile.refreshFromFileSystemSync()

      this.cache[fileName].diagnostics = []//ts_module.getPreEmitDiagnostics(this.projectOptions.program, this.cache[fileName].sourceFile)

      // this.cache[fileName].sourceFile=this.cache[fileName].program.getSourceFile(this.cache[fileName].fileName)
      // this.cache[fileName].simpleSourceFile = this.projectOptions.simpleProject.getSourceFile(fileName)
      // this.cache[fileName].
      // if(
        // this.cache[fileName].sourceFile=this.cache[fileName].program.getSourceFile(this.cache[fileName].fileName)
    // ) { // debug
      //   this.cache[fileName].log('source file instance changed!!!!')
      // }
    // }
    return this.cache[fileName]
  }

  // private cacheGet(fileName: string) {
  // }
  // private rebuildCache(fileName: string) {

  // }


  // private isFileChanged(fileName: string) {
  //   if (!this.fileSnapshots[fileName]) {
  //     this.fileSnapshots[fileName] = this.projectOptions.project.getScriptSnapshot(fileName)
  //     return true
  //   }
  //   const newSnapshot = this.projectOptions.project.getScriptSnapshot(fileName)
  //   const change = newSnapshot.getChangeRange(this.fileSnapshots[fileName])
  //   return change.span.start || change.span.length || change.newLength
  // }


  // getTarget(fileName: string, positionOrRange: number | ts.TextRange): CodeFixOptions{
  //   return null;
  // }
  // isPositionInSomeDiagnostic(codes: number[], opts: CodeFixOptions): boolean {
  //   // this.getCache()
  //   throw new Error("Method not implemented.");
  // }
}

// interface CacheEntry{diagnostics: Diagnostic[]}

export const common = new Common()//	"code": "4025",	"message": "Exported variable 'common' has or is using private name 'Common'.",

// export interface CommonUtil {
//   // isPositionInSomeDiagnostic(codes: number[], arg: CodeFixOptions): boolean 
// }
