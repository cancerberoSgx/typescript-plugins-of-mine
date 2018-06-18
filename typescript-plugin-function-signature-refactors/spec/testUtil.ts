import Project, { ModuleKind, NamedNode, Node, ReferenceFindableNode, ScriptTarget, SignaturedDeclaration, SourceFile } from "ts-simple-ast";
import { reorderParameters } from "../src/refactors/reorderParams/reorderParams";


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
      module: ModuleKind.CommonJS,
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

export interface ReorderAndAssert {
  asserts: {
    before?: string,
    after?: string,
    file?: SourceFile
  }[],
  node?: SignaturedDeclaration & ReferenceFindableNode & Node,
  reorder?: number[],
  verbose?: boolean
}

export function reorderAndAssert({ node, reorder, asserts, verbose = false }: ReorderAndAssert) {
  asserts.filter(a => a.before && a.file).forEach(({ before, after, file }) => {
    expect(file.getText()).toContain(before)
    if (after) {
      expect(file.getText()).not.toContain(after, `OFFENDING file: ${file.getFilePath()}`)
    }
  })
  if (node && reorder && reorder.length) {
    verbose && console.log('BEFORE: ' + node.getText())
    reorderParameters(node, reorder)
    verbose && console.log('AFTER: ' + node.getText())
  }
  asserts.filter(a => a.after && a.file).forEach(({ before, after, file }) => {
    if (before) {
      expect(file.getText()).not.toContain(before, `OFFENDING file: ${file.getFilePath()}`)
    }
    expect(file.getText()).toContain(after, `OFFENDING file: ${file.getFilePath()}`)
  })
}

export function printDiagnostics(project: Project) {
  console.log(project.getDiagnostics()
    .map(d => d.getMessageText().toString() + ' - ' + d.getSourceFile().getFilePath() + '#' + d.getLineNumber())
    .join('\n'))
}

// export function printReferences(helperFunction: NamedNode) {
//   const referencedSymbols = helperFunction.findReferences()
//   for (const referencedSymbol of referencedSymbols) {
//     for (const reference of referencedSymbol.getReferences()) {
//       console.log("---------")
//       console.log("REFERENCE")
//       console.log("---------")
//       console.log("File path: " + reference.getSourceFile().getFilePath());
//       console.log("Start: " + reference.getTextSpan().getStart());
//       console.log("Length: " + reference.getTextSpan().getLength());
//       console.log("Parent kind: " + reference.getNode().getParentOrThrow().getKindName());
//       console.log("\n");
//     }
//   }
// }