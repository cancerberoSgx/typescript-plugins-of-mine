import * as shell from 'shelljs'
import Project, {SourceFile, Node, Diagnostic} from 'ts-simple-ast'
import   {addTextToSourceFile} from 'typescript-ast-util'
import * as ts from 'typescript'

// TODO: test with jsdoc or a trailing comment
const codeFixCreateVariable:CodeFix = {
  name: 'Declare variable',
  config: { variableType: 'const' },
  predicate: (diag: ts.Diagnostic, child: ts.Node):boolean => diag.code === 2304 && // Cannot find name 'i'
    child.kind === ts.SyntaxKind.Identifier &&
    child.parent.kind === ts.SyntaxKind.BinaryExpression &&
    child.parent.parent.kind === ts.SyntaxKind.ExpressionStatement,
  description: (diag:  ts.Diagnostic, child:  ts.Node) : string => `Declare variable "${child.getText()}"`,
  apply: (diag: ts.Diagnostic, child:  Node): void => {
    child.getSourceFile().insertText(child.getStart(), 'const ')
  }
};

const codeFixCreateConstructor:CodeFix = {
  name: 'Declare constructor',
  config: { variableType: 'const' },
  predicate: (diag: ts.Diagnostic, child:ts.Node):boolean => diag.code === 2554 && // Expected 0 arguments, but got 1
    child.kind === ts.SyntaxKind.Identifier &&
    child.parent.kind === ts.SyntaxKind.BinaryExpression &&
    child.parent.parent.kind === ts.SyntaxKind.ExpressionStatement,
  description: (diag: ts.Diagnostic, child: ts.Node) : string => `Declare constructor "${child.getText()}"`,
  apply: (diag: ts.Diagnostic, child: Node) => {
    // child.getSourceFile().insertText(child.getStart(false), 'const '); 
  }
};

export interface CodeFix {
  name: string
  config: any
  predicate(diag: ts.Diagnostic, child:ts.Node) : boolean
  description (diag: ts.Diagnostic, child: ts.Node) : string
  apply(diag: ts.Diagnostic, child: Node):void
}


export const codeFixes = [
  codeFixCreateVariable
];