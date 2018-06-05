
let c1 = 1, d = []

function fff() {
  let a123123 = 1, b = 'a'
  console.log(123);

}

function Require(s){return null}
const underscore = Require('underscore'), moment = Require('moment'), handlebars = Require('handlebars'); 


import { TypeGuards, VariableStatementStructure } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
let print
/**
 
# Description

convert multiple variabe declarations in the same decl list, into separate variable declaration list

# Example

```
let a = 1, b='a'
```

select that statement or part of it will suggest "convert to multiple variable declaration statement": 

```
let a = 1
let b = 'a'
```
*/
function evaluateMe() {
  print = c.print
  c.log = c.print
  // clone source file so this one is not modified
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
  const id = sourceFile.getDescendantAtPos(217)
  const varDeclList = id.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclarationList)

  if (!varDeclList || !TypeGuards.isVariableDeclarationList(varDeclList)) {
    c.log('variable declaration list ancestor not found')
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


    const variableStatement = id.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
    const indexToInsert = variableStatement.getChildIndex()
    container.removeStatement(indexToInsert)
    // print(.getKindName()+' - '+container.getKindName())
    container.insertVariableStatements(indexToInsert, variableStatements)
  } else {
    c.log(` doing nothing because condition not meet: ${TypeGuards.isBlock(container) || TypeGuards.isSourceFile(container)} - container kind is ${container.getKindName()}`)
    return
  }
  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}