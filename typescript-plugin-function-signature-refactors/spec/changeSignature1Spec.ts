import Project, { ScriptTarget, NamedNode, CallExpression, TypeGuards, SignaturedDeclaration, ArgumentedNode, Node } from "ts-simple-ast";
import { reorderParameters } from "../src/reorderParams";
import { decodedTextSpanIntersectsWith } from "../../typescript-plugin-util/node_modules/typescript";

// doTest(config)
describe('try to change signature param type', () => {
  let project: Project
  it('test1', async () => {
    project = new Project({
      compilerOptions: {
        target: ScriptTarget.ES2018
      },
      useVirtualFileSystem: true
    })
    const helperFile = project.createSourceFile('model/helper.ts', `
export function helper(param1: string, param2: number, param3: boolean): string {
  return param1 + ' and '+param2 + ' and ' +param3
}
    `)
    const indexFile = project.createSourceFile('index.ts', `
import {helper} from './model/helper'
console.log(helper('param', 3.14, true))
    `)
    const targetFunction = helperFile.getFunction('helper')
    expect(indexFile.getText()).not.toContain(`console.log(helper(3.14, 'param', true)`)
    reorderParameters(targetFunction, [1,0])
    expect(indexFile.getText()).toContain(`console.log(helper(3.14, 'param', true)`)
    // printDiagnostics(project)
    // printReferences(targetFunction)
    // console.log(indexFile.getText());

  })
})

function printDiagnostics(project: Project){
  console.log(project.getDiagnostics().map(d=>d.getMessageText()).join(', '))
}

function printReferences(helperFunction: NamedNode) {
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