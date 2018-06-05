
import * as ts from 'typescript';
import { getKindName, findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { Statement } from '../../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary';
import { Block, SourceFile, TypeGuards, StatementedNode, Node, VariableStatementStructure } from 'ts-simple-ast';

/**

# Description

This refactor will split a variable declaration list with multiple variable declarations into single variable declaration statements. 

# Example

```let i = 0, c = 's', arr = []```

Selecting any fragment of previous statement will suggest te refactor "Split variable declaration list" and if applied it will result in the following code:

```
let i = 0
let c = 's'
let arr = []
```

It doesn't attack any error diagnostic.

*/

export const splitVariableDeclarationList: CodeFix = {
  name: 'splitVariableDeclarationList',
  config: {}, // TODO; add inferred types to generated var decl stmts ?  currently adding. 
  predicate: (arg: CodeFixOptions): boolean => {
    const varDeclList = findAscendant<ts.VariableDeclarationList>(arg.containingTargetLight, ts.isVariableDeclarationList, true)
    if(!varDeclList){
      arg.log('splitVariableDeclarationList predicate false because no VariableDeclarationList ascendant found - containingTarget was ' + getKindName(arg.containingTargetLight))
      return false
    }
    return true
  },

  description: (arg: CodeFixOptions): string => `Split variable declaration list`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const varDeclList = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclarationList)
    if (!varDeclList || !TypeGuards.isVariableDeclarationList(varDeclList)) { 
      arg.log('splitVariableDeclarationList not apply because no splitVariableDeclarationList ancestor was found')
      return
    }
    const container = varDeclList.getParent().getParent()
    if (TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container)) {
      const variableStatements = varDeclList.getDeclarations().map(d => ({
        declarationKind: varDeclList.getDeclarationKindKeyword().getText(),
        declarations: [{
          hasExclamationToken: d.hasExclamationToken(),
          name: d.getName(),
          type: d.getType().getText(),
          initializer: d.getInitializer().getText()
  
        }]
      })
      ) as VariableStatementStructure[]
  
      const variableStatement = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
      const indexToInsert = variableStatement.getChildIndex()
      container.removeStatement(indexToInsert)
      container.insertVariableStatements(indexToInsert, variableStatements)
    } else {
      arg.log(`splitVariableDeclarationList not apply because condition not meet: TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container) === ${TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container)} - container kind is ${container.getKindName()}`)
    }
  }
}
