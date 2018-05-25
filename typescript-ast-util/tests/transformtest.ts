import * as ts from 'typescript';
import {getKindName, printNode} from '../src'




const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
  return (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);
      if(ts.isPropertyAccessExpression(node) && node.name && node.name.getText()==='let'){
        return node.expression
      }
      return node;
    }
    return ts.visitNode(rootNode, visit);
  } 
};


const source: string = `
function f(a, b, c, foo) {
  if (a < b)
    return a > 3 * foo.bar.alf && b < c.let;
}
`;
const sourceFile: ts.SourceFile = ts.createSourceFile(
  'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
);

const printer: ts.Printer = ts.createPrinter();

console.log(printer.printFile(sourceFile));

// Options may be passed to transform
const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
  sourceFile, [transformer]
);

const transformedSourceFile: ts.SourceFile = result.transformed[0];


console.log(printer.printFile(transformedSourceFile));

result.dispose();