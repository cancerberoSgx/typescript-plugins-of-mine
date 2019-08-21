
import { VariableDeclarationKind, TypeGuards, VariableDeclaration, FunctionDeclaration, MethodDeclaration, ParameterDeclaration, PropertyDeclaration } from 'ts-morph';
import * as ts from 'typescript';
import { getKindName, findAscendant, getTypeStringFor } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { buildRefactorEditInfo } from '../util';

/*

# description

in a statement like `function(): number {return 's'}` it will suggest to change the function return type to string

# Attacks
```
{
	"code": "2322",
	"message": "Type '\"a\"' is not assignable to type 'number'.",
}
```
  */
export const changeReturnType: CodeFix = {

  name: 'changeReturnType',

  config: {
  },

  predicate: (arg: CodeFixOptions): boolean => {
    const returnStatement = findAscendant(arg.containingTargetLight, ts.isReturnStatement, true)
    if (returnStatement &&
      arg.diagnostics.find(d => d.code === 2322 && d.start === returnStatement.getStart())) {
      return true
    }
    else {
      return false
    }
  },

  description: (arg: CodeFixOptions): string => {
    // const returnStatement = findAscendant(arg.containingTargetLight, ts.isReturnStatement, true) as ts.ReturnStatement
    // const type = getTypeStringFor(returnStatement.expression, arg.program)    
    // return 'Change return type'+( type ? (' to '+type) :  '')
    return 'Change return type of enclosing function'
  },

  apply: (arg: CodeFixOptions) => {
    const node = arg.simpleNode
    const returnStatement = node.getFirstAncestorByKind(ts.SyntaxKind.ReturnStatement)
    const fn = returnStatement.getFirstAncestor(a=>TypeGuards.isFunctionDeclaration(a)||TypeGuards.isMethodDeclaration(a)) as FunctionDeclaration | MethodDeclaration
    return buildRefactorEditInfo(arg.sourceFile, returnStatement.getExpression().getType().getBaseTypeOfLiteralType().getText(), fn.getReturnTypeNode().getStart(), fn.getReturnTypeNode().getWidth())
    // fn.setReturnType(returnStatement.getExpression().getType().getBaseTypeOfLiteralType().getText())
  }

}
