
import { Node, SourceFile, StatementedNode, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { getDefaultValueForType } from '../util';

/**

# description

function-like is returning a value but no return type was declared in signature. suggest adding a return type inferring from return value

# example

```const other = (a: string): number => {}```

# Attacks

"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.",

*/

export const addReturnStatement: CodeFix = {
  name: 'addReturnStatement',
  config: {},
  predicate: (arg: CodeFixOptions): boolean => {
    const kind = getKindName(arg.containingTargetLight)
    const kindToIncludeAnyOf = ['Identifier', 'Keyword', 'Type']
    if (kindToIncludeAnyOf.find(k => kind.includes(k)) &&
      arg.diagnostics.find(d => d.code === 2355 && d.start === arg.containingTargetLight.getStart())) {
      return true
    }
    else {
      arg.log(`addReturnStatement predicate false because child.kind===${kind} dont include any of ${kindToIncludeAnyOf.join(', ')}`)
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Add return statement`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const firstStatementedNode = arg.simpleNode.getAncestors().find(TypeGuards.isStatementedNode)
    if (firstStatementedNode) {
      addReturnStatementImpl(arg.simpleNode.getSourceFile(), firstStatementedNode)
    }
    else {
      arg.log('addReturnStatement apply aborted because firstStatementedNode is null')
    }
  }
}

function addReturnStatementImpl(sourceFile: SourceFile, node: StatementedNode & Node) {
  // const statements = node.getStatements()
  node.addStatements(`return ${getDefaultValueForType(node.getType())};`)  // this fails (  https://github.com/dsherret/ts-ast-viewer/issues/20)so we hack: 
  //TODO: should be fixed - update ts-simple-ast
  //TODO: use getDefaultValueForType to return an example value instead of null
  // if(statements.length){
  //   sourceFile.insertText(statements[statements.length-1].getEnd(), '\nreturn null;')
  // }  
  // else{
  //   sourceFile.insertText(node.getEnd()-1, '\nreturn null;\n')
  // }
}