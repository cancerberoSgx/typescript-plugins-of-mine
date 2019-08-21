
import * as ts from 'typescript';
import { getKindName, findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { Statement } from '../../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary';
import { Block, SourceFile, TypeGuards, StatementedNode, Node, VariableStatementStructure } from 'ts-morph';
import { buildRefactorEditInfo } from '../util';

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

# TODO
 * unsplit variables - if we are in a more than one var decl statement 
 * config
*/

export const splitVariableDeclarationList: CodeFix = {
  name: 'splitVariableDeclarationList',

  config: {
    // TODO; add inferred types to generated var decl stmts ?  currently adding. 
    addTypes: true
  },

  predicate: (arg: CodeFixOptions): boolean => {
    const varDeclList = findAscendant<ts.VariableDeclarationList>(arg.containingTargetLight, ts.isVariableDeclarationList, true)
    if (!varDeclList) {
      arg.log('predicate false because no VariableDeclarationList ascendant found - containingTarget was ' + getKindName(arg.containingTargetLight))
      return false
    }
    else if (varDeclList.declarations.length <= 1) {
      arg.log('predicate false because list has only one declaration')
      return false
    }
    return true
  },

  description: (arg: CodeFixOptions): string => `Split variable declaration list`,

  apply: (arg: CodeFixOptions) => {
    const varDeclList = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclarationList)
    if (!varDeclList || !TypeGuards.isVariableDeclarationList(varDeclList)) {
      arg.log('not apply because no splitVariableDeclarationList ancestor was found')
      return
    }
    const container = varDeclList.getParent().getParent()
    if (TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container)) {
      const variableStatements = varDeclList.getDeclarations().map(d => ({
        declarationKind: varDeclList.getDeclarationKindKeyword().getText(),
        declarations: [{
          hasExclamationToken: d.hasExclamationToken(),
          name: d.getName(),
          type: d.getTypeNode() ? d.getTypeNode().getText() : d.getType().getText(),
          initializer: d.getInitializer().getText()
        }]
      })
      ) as VariableStatementStructure[]

      const variableStatement = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)

      const start = variableStatement.getStart()
      const length = variableStatement.getFullWidth()// + 2 // TODO: don't know why I have to do +2 in order to work OK

      const variableStatementNodes = container.insertVariableStatements(0, variableStatements)
      const code = variableStatementNodes.map(s => s.getText()).join('\n') // TODO: respect formatOptions

      return buildRefactorEditInfo(arg.sourceFile, code, start, length)

    } else {
      arg.log(`not apply because condition not meet: TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container) === ${TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container)} - container kind is ${container.getKindName()}`)
    }
  }
}
