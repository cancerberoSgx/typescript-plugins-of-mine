import * as ts from 'typescript'
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
  return (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);
      // in a property access expression like "foo.bar" "foo" is the expression and "bar" is the name : 
      // we replace the whole expression with just node.expression in the case name is "accessorToBeRemoved"
      if (ts.isPropertyAccessExpression(node) && node.name &&
        node.name.getText() === 'accessorToBeRemoved') {
        return node.expression
      }
      return node;
    }
    return ts.visitNode(rootNode, visit);
  }
};
const source: string = `
const a = foo.accessorToBeRemoved
`;
const sourceFile: ts.SourceFile = ts.createSourceFile(
  'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
);
const printer: ts.Printer = ts.createPrinter();
const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
  sourceFile, [transformer]
);
const transformedSourceFile: ts.SourceFile = result.transformed[0];
console.log(printer.printFile(transformedSourceFile));
result.dispose();