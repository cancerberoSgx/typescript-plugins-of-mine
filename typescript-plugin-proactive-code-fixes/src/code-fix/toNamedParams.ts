
import * as ts from 'typescript';
import { getKindName, findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { Statement } from '../../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary';
import { Block, SourceFile, TypeGuards, StatementedNode, Node, VariableStatementStructure, FunctionTypeNode, InterfaceDeclarationStructure, ParameterDeclarationStructure } from 'ts-simple-ast';

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
export const toNamedParameters: CodeFix = {
  name: 'toNamedParameters',
  config: {},  
  predicate: (arg: CodeFixOptions): boolean => {
    const param = findAscendant<ts.VariableDeclarationList>(arg.containingTargetLight, ts.isParameter, true)
    if(!param){
      arg.log('predicate false because no  Parameter ascendant found - containingTarget was ' + 
        getKindName(arg.containingTargetLight))
      return false
    }
    return true
  },

  description: (arg: CodeFixOptions): string => `Convert to Named Parameters`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const functionLikeDeclaration = arg.simpleNode.getAncestors().find(TypeGuards.isFunctionLikeDeclaration)
    if (!functionLikeDeclaration) {
      arg.log('not applied because FunctionLikeDeclaration ancestor not found')
      return
    }
    const container = functionLikeDeclaration.getParent()
    if(!TypeGuards.isStatementedNode(container)){
      arg.log('FunctionLikeDeclaration.getParent not applied because is not TypeGuards.isStatementedNode(container)')
      return
    }
    let interfaceName = (functionLikeDeclaration as any).getName() ? (functionLikeDeclaration as any).getName()+'' : 'UnnamedOptions'
    interfaceName = interfaceName.substring(0, 1).toUpperCase() + interfaceName.substring(1, interfaceName.length)
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
  
    container.insertInterface(functionLikeDeclaration.getChildIndex(), interfaceStructure)
    const parameterDeclarationStructure: ParameterDeclarationStructure = {
      name: '{'+functionLikeDeclaration.getParameters().map(param=>param.getName()+(param.getInitializer() ? (' = '+param.getInitializer().getText()) : '')).join(', ')+'}',
      type: interfaceName
    }
    functionLikeDeclaration.getParameters().forEach(param=>param.remove())
    functionLikeDeclaration.addParameter(parameterDeclarationStructure)
  }
}
