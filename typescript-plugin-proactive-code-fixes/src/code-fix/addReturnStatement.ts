
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { Statement } from '../../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary';
import { Block, SourceFile, TypeGuards, StatementedNode, Node } from 'ts-simple-ast';

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
    if (!arg.diagnostics.find(d => d.code === 2355)) {
      return false
    }
    const kind = getKindName(arg.containingTarget)
    const kindToIncludeAnyOf = ['Identifier', 'Keyword', 'Type']
    if (kindToIncludeAnyOf.find(k=>kind.includes(k))) {
      return true
    }    
    else {
      arg.log('addReturnStatement predicate false because child.kind dont include any of ' + kindToIncludeAnyOf.join(', '))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Add Return Statement`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const firstStatementedNode = arg.simpleNode.getAncestors().find(TypeGuards.isStatementedNode)
    if(firstStatementedNode){
      addReturnStatementImpl(arg.simpleNode.getSourceFile(), firstStatementedNode)
    }
  }
}

function addReturnStatementImpl(sourceFile: SourceFile, node: StatementedNode&Node){
  const statements = node.getStatements()
  // methodDecl.addStatements('return null;')  // this fails (  https://github.com/dsherret/ts-ast-viewer/issues/20)so we hack: 
  //TODO: should be fixed - update ts-simple-ast
  //TODO: use getDefaultValueForType to return an example value instead of null
  if(statements.length){
    sourceFile.insertText(statements[statements.length-1].getEnd(), '\nreturn null;')
  }  
  else{
    sourceFile.insertText(node.getEnd()-1, '\nreturn null;\n')
  }
}