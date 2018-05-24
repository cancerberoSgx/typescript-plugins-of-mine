import { compileSource, findChild, findAscendant, getKindName, filterChildren } from "../src";
import { SyntaxKind, FunctionDeclaration, Node } from "typescript";

describe('findAscendant', () => {
  it('should work', () => {
    const {program, fileName, tsconfigPath} = compileSource('function f (a, b, c){return (false && a > 313) && b < c}')
    const number313 = findChild(program.getSourceFile(fileName), (c=>c.getText()==='313'))
    expect(number313.getText()).toBe('313')
    const fd = findAscendant(number313, (a)=>a.kind===SyntaxKind.FunctionDeclaration) as FunctionDeclaration

    const isExpression = (node:ts.Node)=>getKindName(node).endsWith('Expression') || node.kind === SyntaxKind.Identifier || getKindName(node).endsWith('Literal')
    expect(fd.name.getText()).toBe('f')  
    // console.log(fd.body.getChildren().find(c=>  isExpression(c)||!!c.getChildren().find(c=>isExpression(c))),
    // filterChildren(fd.body.getChildren().find(isExpression), isExpression).map(n=>n.getText()).join(', ')
    // )
  })
})