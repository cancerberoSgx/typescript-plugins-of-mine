import Project, { NamedNode, ScriptTarget, SourceFile, ModuleKind, SignaturedDeclaration, ReferenceFindableNode, Node } from "ts-simple-ast";
import { reorderParameters } from "../src/reorderParams";

export interface Config {
  files: { name: string, text: string, path: string }[]
}
export interface Result {
  files: { [name: string]: SourceFile },
  project: Project
}
export function doTest(config: Config): Result {
  let project: Project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2018,
      module:  ModuleKind.CommonJS,
      lib: [
        "es2018"
      ]
    },
    useVirtualFileSystem: true
  })
  const result: Result = { project, files: {} }
  config.files.forEach(f => {
    result.files[f.name] = project.createSourceFile(f.path, f.text)
  })
  return result
}

interface ReorderAndAssert {
  asserts: {
    before: string, 
    after: string, 
    file: SourceFile}[],
   node: SignaturedDeclaration & ReferenceFindableNode & Node, 
   reorder: number[]
  }
export function reorderAndAssert( {node, reorder, asserts  }: ReorderAndAssert ) {
  asserts.forEach( ({before, after, file}) =>{
    expect(file.getText()).toContain(before)
    // console.log('BEFORE: '+file.getText())
    // expect(file.getText()).not.toContain(after)
  })
  
  reorderParameters(node, reorder)
  
  asserts.forEach( ({before, after, file}) =>{
    file.saveSync()
    // expect(file.getText()).not.toContain(before)
  // console.log('AFTER: '+file.getText())
    expect(file.getText()).toContain(after)
  })
}

export function printDiagnostics(project: Project) {
  console.log(project.getDiagnostics().map(d => d.getMessageText().toString() + ' - '+d.getSourceFile().getFilePath()).join('\n'))
}

export function printReferences(helperFunction: NamedNode) {
  const referencedSymbols = helperFunction.findReferences()
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      console.log("---------")
      console.log("REFERENCE")
      console.log("---------")
      console.log("File path: " + reference.getSourceFile().getFilePath());
      console.log("Start: " + reference.getTextSpan().getStart());
      console.log("Length: " + reference.getTextSpan().getLength());
      console.log("Parent kind: " + reference.getNode().getParentOrThrow().getKindName());
      console.log("\n");
    }
  }
}