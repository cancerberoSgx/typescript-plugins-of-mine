/*
Attacks this problem:   

//"code": "2355",	"message": "A function whose declared type is neither 'void' nor 'any' must return a value.",
*/

import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

export const addReturnStatement: CodeFix = {
  name: 'addReturnStatement',
  config: {},
  predicate: (arg: CodeFixOptions): boolean => {
    //TODO: review this predicate
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
  description: (arg: CodeFixOptions): string => `Add return statement?`,
  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const funcDecl = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
    if (funcDecl) {
      funcDecl.addStatements('return null;')
    }
    const arrowDecl = arg.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.ArrowFunction)
    if (arrowDecl) {
      arrowDecl.addStatements('return null;')
    }
  }
}