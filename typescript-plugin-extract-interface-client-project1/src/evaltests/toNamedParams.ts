function foo (a: number, b: string[], c: (n:number)=>boolean[], d?: boolean){}

/**
 
# Description

see https://github.com/Microsoft/TypeScript/issues/23552

# Attacks

This refactor doesn't attack any diagnostic error

# Example

```
function foo (a: number, b: string[], c: (n:number)=>boolean[], d?: boolean){}
```

select a fragment of the parameter list will suggest "declare interface from named parameters" and if applied will change the code to : 

```
interface FooOptions{
  a: number
  b: string[]
  c?: boolean
}
function foo({a,b,c}: FooOptions){}
```
*/
import { TypeGuards, VariableStatementStructure, FunctionTypeNode, InterfaceDeclarationStructure } from 'ts-simple-ast';
import * as ts from 'typescript';
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
let print

function evaluateMe() {
  print = c.print
  c.log = c.print
  // clone source file so this one is not modified
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
  const id = sourceFile.getDescendantAtPos(34)
  // return print(id.getAncestors().map(a=>a.getKindName()).join(', '))
  const functionLikeDeclaration = id.getAncestors().find(TypeGuards.isFunctionLikeDeclaration)

  if (!functionLikeDeclaration) {
    c.log('FunctionLikeDeclaration ancestor not found')
    return
  }

  print('seba: '+  functionLikeDeclaration.getParameters().map(param=>param.getName()+'-'+param.getTypeNode().getKindName()).join(', ')+' - '+functionLikeDeclaration.getParent().getKindName()) //param.getTypeNode().getText()).join(', '))

  let interfaceName = (functionLikeDeclaration as any).getName() ? (functionLikeDeclaration as any).getName()+'' : 'UnnamedOptions'
  interfaceName = interfaceName.substring(0, 1).toUpperCase() + interfaceName.substring(1, interfaceName.length)
  const interfaceStructure = {
    name: interfaceName,
    properties:  functionLikeDeclaration.getParameters().filter(param=>param.getTypeNode().getKind()!==ts.SyntaxKind.FunctionType).map(param=>({
      name: param.getName(), 
      type: param.getTypeNode().getText()
    })),
    methods: functionLikeDeclaration.getParameters().filter(param=>param.getTypeNode().getKind()==ts.SyntaxKind.FunctionType).map(param=>({
      name: param.getName(), 
      returnType: (param.getTypeNode() as FunctionTypeNode ).getReturnTypeNode().getText(),
      parameters: (param.getTypeNode() as FunctionTypeNode ).getParameters().map(param=>({
        name: param.getName(), 
        type: param.getTypeNode().getText()})
        //TODO question mark
      )
      // type: param.getTypeNode().getText()
      //TODO: question mark
    })),
    //TODO: constructors ?
  } as InterfaceDeclarationStructure; 

  //TODO: what about function param initializers ? TODO: put initiailzers in the generated param object

  const container = functionLikeDeclaration.getParent()
  if(!TypeGuards.isStatementedNode(container)){
    return // TODO: log
  }
  container.insertInterface(functionLikeDeclaration.getChildIndex(), interfaceStructure)
  // functionLikeDeclaration.getAncestors().find(TypeGuards.isStatementedNode)

  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}