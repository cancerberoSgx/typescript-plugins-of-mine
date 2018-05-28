// import { CodeFix, CodeFixOptions, CodeFixFileOptions } from "./typings";
// import { TextRange, ScriptSnapshot, IScriptSnapshot, Diagnostic } from "typescript";
// // import { Diagnostic } from "ts-simple-ast";
// import * as tss from 'typescript/lib/tsserverlibrary';
// import { createSimpleASTProject } from "typescript-plugin-util";
// // this one exec first so it calculate, caches and provide common data and operations to others (performance). Must be installed the first.
// // const Project = tss.server.Project

// export  class Common implements CodeFix, CommonUtil {
//   needSimpleAst?: boolean = true;
//   predicateArgs: CodeFixOptions;
//   name: string = 'common_utilities'
//   config = {}
  
//   fileSnapshots: {
//     [key:string]: IScriptSnapshot
//   } = {}
  
//   private cache: {[key:string]:CodeFixFileOptions} = {}

//   predicate(opts: CodeFixOptions): boolean  {
//     if(this.isFileChanged(opts.fileName, opts.project)){
//       this.cleanCache(opts.fileName)
//     }
//     return false;
//   }

//   description(opts: CodeFixOptions): string { return `commonchangerange?`}

//   apply (opts: CodeFixOptions): ts.ApplicableRefactorInfo[] | void {
//     return undefined
//   }

//   public getOptionsFor(fileName: string, project: tss.server.Project): CodeFixFileOptions{
//     if(!this.cache[fileName]){
//       const program = project.getLanguageService().getProgram()
//       const simpleProject = createSimpleASTProject(project)

//     //   sourceFile = simpleProject.getSourceFile(fileName)
//     //   this.cache[fileName] = {
//     //     project,fileName, program , sourceFile: program.getSourceFile(fileName), 
//     //   }
//     // }
//     // if(this.isFileChanged(fileName, project)){
//     //   this.cleanCache(fileName)
//     //   this.cache[fileName] = {
//     //     diagnostics: 
//     //   }
//     }
//     return this.cache[fileName]
//   }

//   private cleanCache(fileName: string){
//     this.fileSnapshots[fileName] = undefined
//     this.cache[fileName] = undefined
//   }


//   private isFileChanged(fileName: string, project:tss.server.Project){
//     if(!this.fileSnapshots[fileName]){
//       this.fileSnapshots[fileName] = project.getScriptSnapshot(fileName)
//       return true
//     }
//     const newSnapshot = project.getScriptSnapshot(fileName)
//     const change = newSnapshot.getChangeRange(this.fileSnapshots[fileName])
//     return change.span.start || change.span.length || change.newLength
//   }

  
//   // getTarget(fileName: string, positionOrRange: number | ts.TextRange): CodeFixOptions{
//   //   return null;
//   // }
//   // isPositionInSomeDiagnostic(codes: number[], opts: CodeFixOptions): boolean {
//   //   // this.getCache()
//   //   throw new Error("Method not implemented.");
//   // }
// }

// // interface CacheEntry{diagnostics: Diagnostic[]}

// export const common = new Common()//	"code": "4025",	"message": "Exported variable 'common' has or is using private name 'Common'.",

// export interface CommonUtil{
//   // isPositionInSomeDiagnostic(codes: number[], arg: CodeFixOptions): boolean 
// }
