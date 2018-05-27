import { findChild, getKindName } from "../src";
import * as ts from 'typescript';

function test() {

  const transformFactory = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    let nameCounter = 0
    const visit = (node: ts.Node) => {
      node = ts.visitEachChild(node, visit, context);
      if (ts.isFunctionDeclaration(node) && (!node.name || !node.name.escapedText)) {
        // we can actually change the node using two techniques, the first one is creating a new mutable clone and modify it and return it
        const clone = ts.getMutableClone(node)
        clone.name = ts.createIdentifier('unnamedFunc')
        return clone
        // the second one is creating a new node using the ts.create* functions
        // return ts.createFunctionDeclaration(node.decorators, node.modifiers, node.asteriskToken,
        //   ts.createIdentifier('unnamedFunc'), node.typeParameters, node.parameters, node.type, node.body)
      }
      return node
    }
    return ts.visitNode(rootNode, visit)
  }

  const source = `
function(a: number):[number]{ return [Math.PI*a/2]}
function named(b:string){return 123}
`
  const sourceFile = ts.createSourceFile(
    'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  )
  const tranformationResult = ts.transform(sourceFile, [transformFactory])
  const resultFile = ts.createSourceFile("someFileName.ts", "", ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
  const printer = ts.createPrinter();
  const result = printer.printNode(ts.EmitHint.Unspecified, tranformationResult.transformed[0], resultFile);
  console.log(result)
}

test()