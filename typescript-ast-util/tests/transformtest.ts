import * as ts from 'typescript';

const printer: ts.Printer = ts.createPrinter();

const source: string = `var x = 1 + 2 + 3;`;

const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
        console.log("Visiting " + ts.SyntaxKind[node.kind]);
        node = ts.visitEachChild(node, visit, context);
        if (node.kind === ts.SyntaxKind.BinaryExpression) {
            const binary = node as ts.BinaryExpression;
            if (binary.left.kind === ts.SyntaxKind.NumericLiteral && binary.right.kind === ts.SyntaxKind.NumericLiteral) {
                const left = binary.left as ts.NumericLiteral;
                const leftVal = parseFloat(left.text);
                const right = binary.right as ts.NumericLiteral;
                const rightVal = parseFloat(right.text);
                switch (binary.operatorToken.kind) {
                    case ts.SyntaxKind.PlusToken:
                        return ts.createLiteral(leftVal + rightVal);
                    case ts.SyntaxKind.AsteriskToken:
                        return ts.createLiteral(leftVal * rightVal);
                    case ts.SyntaxKind.MinusToken:
                        return ts.createLiteral(leftVal - rightVal);
                }
            }
        }
        return node;
    }
    return ts.visitNode(rootNode, visit);
};

const sourceFile: ts.SourceFile = ts.createSourceFile(
  'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
);

console.log(printer.printFile(sourceFile));

// Options may be passed to transform
const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
  sourceFile, [ transformer ]
);

const transformedSourceFile: ts.SourceFile = result.transformed[0];


console.log(printer..printFile(transformedSourceFile));

result.dispose();