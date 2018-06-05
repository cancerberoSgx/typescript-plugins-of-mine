
let c1= 1, d= []

function fff(){
  let a = 1, b='a'
}

import * as ts from 'typescript'
import { ClassDeclaration, InterfaceDeclaration, TypeGuards, ExpressionWithTypeArguments, ParameterDeclaration, ParameterDeclarationStructure, Type, MethodSignature, FunctionLikeDeclaration, VariableDeclarationKind } from 'ts-simple-ast'
import { EvalContext } from 'typescript-plugin-ast-inspector';
import { dumpAst } from 'typescript-ast-util'
import { ok } from 'assert';
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
  const id = sourceFile.getDescendantAtPos(6)
  const varDeclList = id.getFirstAncestorByKind(ts.SyntaxKind.VariableDeclarationList)
  // print('hshshshshs')
  if (!varDeclList || !TypeGuards.isVariableDeclarationList(varDeclList)) {
    c.log('variable declaration list ancestor not found')
    return // TODO: log
  }
  // print(varDeclList.getParent().getParent().getKindName()+ ' - ' + varDeclList.getDeclarationKindKeyword().getText() + ' - '+varDeclList.getDeclarations().map(d=>d.getText()).join(', '))
  const container = varDeclList.getParent().getParent()
  // let varDeclListStructure
  if(TypeGuards.isBlock(container)||TypeGuards.isSourceFile(container)){
    const varDeclListStructure = varDeclList.getDeclarations().map(d=>({
      // container.addVariableStatement({
        declarationKind: varDeclList.getDeclarationKindKeyword().getText() as VariableDeclarationKind, 
        declarations: [{
          hasExclamationToken: d.hasExclamationToken(), 
          name: d.getName(), 
          type: d.getType().getText(), 
          initializer: d.getInitializer().getText()
        }]
      // })
    }))

  varDeclList.fill(varDeclListStructure)
  }else {
    c.log(`not doing anything because condition not meet: ${TypeGuards.isBlock(container)||TypeGuards.isSourceFile(container)} - container kind is ${container.getKindName()}`)
  }
  // varDeclList.replaceWithText)=
  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}