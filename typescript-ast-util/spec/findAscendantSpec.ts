import { compileSource, findChild, findAscendant, getKindName } from "../src";
import { SyntaxKind, FunctionDeclaration, Node } from "typescript";

describe('findAscendant', () => {
  it('should work', () => {
    const {program, fileName, tsconfigPath} = compileSource('function f (a, b, c){return (false && a > 313) && b < c}')
    const number313 = findChild(program.getSourceFile(fileName), (c=>c.getText()==='313'))
    expect(number313.getText()).toBe('313')
    const fd = findAscendant(number313, (a)=>a.kind===SyntaxKind.FunctionDeclaration) as FunctionDeclaration

    expect(fd.name.getText()).toBe('f')    
    
  })
})