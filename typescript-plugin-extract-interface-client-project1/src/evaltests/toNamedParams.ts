function foo (a: number, b: string[], c: (n:number)=>boolean[], d?: boolean, e=3.14): ()=>boolean {return ()=>true}


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
import { TypeGuards, VariableStatementStructure, FunctionTypeNode, InterfaceDeclarationStructure, ParameterDeclarationStructure } from 'ts-simple-ast';
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

  // print('seba: '+  functionLikeDeclaration.getParameters().map(param=>param.getName()+'-'+param.getTypeNode().getKindName()).join(', ')+' - '+functionLikeDeclaration.getParent().getKindName()) //param.getTypeNode().getText()).join(', '))

  const container = functionLikeDeclaration.getParent()
  if(!TypeGuards.isStatementedNode(container)){
    return // TODO: log
  }
  let interfaceName = (functionLikeDeclaration as any).getName() ? (functionLikeDeclaration as any).getName()+'' : 'UnnamedOptions'
  interfaceName = interfaceName.substring(0, 1).toUpperCase() + interfaceName.substring(1, interfaceName.length)
// print(  functionLikeDeclaration.getParameters().map(p=> p.getType().getTargetType().getText()).join(', '))
  const interfaceStructure = {
    name: interfaceName,
    properties:  functionLikeDeclaration.getParameters().filter(param=>!param.getTypeNode() || param.getTypeNode().getKind()!==ts.SyntaxKind.FunctionType) // TODO: this will ignore/wrong-print parameters of type function that have an assignament
    .map(property=>({
      name: property.getName(), 
      type: property.getTypeNode() && property.getTypeNode().getText() || property.getType() && property.getType().getText(),
      hasQuestionToken: property.hasQuestionToken()
    })),
    methods: functionLikeDeclaration.getParameters().filter(param=>param.getTypeNode() && param.getTypeNode().getKind()==ts.SyntaxKind.FunctionType).map(method=>({
      name: method.getName(), 
      returnType: method.getTypeNode() &&  (method.getTypeNode() as FunctionTypeNode ).getReturnTypeNode() && (method.getTypeNode() as FunctionTypeNode ).getReturnTypeNode().getText(),
      parameters: (method.getTypeNode() as FunctionTypeNode ).getParameters().map(param=>({
        name: param.getName(), 
        type: param.getTypeNode() &&  param.getTypeNode().getText()|| param.getType() && param.getType().getText(),
        hasQuestionToken: param.hasQuestionToken()
      })),
      hasQuestionToken: method.hasQuestionToken()
    })),
  } as InterfaceDeclarationStructure; 

  //TODO: what about function param initializers ? TODO: put initiailzers in the generated param object

  container.insertInterface(functionLikeDeclaration.getChildIndex(), interfaceStructure)
  const parameterDeclarationStructure: ParameterDeclarationStructure = {
    name: '{'+functionLikeDeclaration.getParameters().map(param=>param.getName()+(param.getInitializer() ? (' = '+param.getInitializer().getText()) : '')).join(', ')+'}',
    type: interfaceName
  }
  // print(parameterDeclarationStructure.name)
  functionLikeDeclaration.getParameters().forEach(param=>param.remove())
  functionLikeDeclaration.addParameter(parameterDeclarationStructure)
  print(sourceFile.getText())
  sourceFile.deleteImmediatelySync()
}