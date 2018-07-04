import { SyntaxKind } from "typescript";
import { createProgram, findChild } from "../src";

describe('createProgram', () => {
  it('should create parent nodes so findChild doesn\'t fail', () => {
    const program = createProgram([
      { fileName: 'one.ts', content: 'const a:number = 1' },
      { fileName: 'two.ts', content: 'class A{color: string="red"}' }
    ])
    const one = findChild(program.getSourceFile('one.ts'), c => c.getText().includes('1'))
    expect(findChild(program.getSourceFile('one.ts'), c => c.getText().includes('= 1'))).toBeDefined()
    expect(findChild(program.getSourceFile('two.ts'), c => c.kind === SyntaxKind.ClassDeclaration)).toBeDefined()
  })
})