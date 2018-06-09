
import { TypeGuards } from 'ts-simple-ast';
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
    // try to get the type so we can return a nice object instead of just null
    const fn = arg.simpleNode.getAncestors().find(TypeGuards.isSignaturedDeclaration)  //TODO: tsa issue - isFunctionLikeDeclaration should include arrowFunction - in general arrowFunction should be a functionlike declaration https://github.com/dsherret/ts-simple-ast/issues/345

    let returnValueString = `null`
    if (fn && fn.getReturnType()) {
      returnValueString = getDefaultValueForType(fn.getReturnType())
    }
    const firstStatementedNode = arg.simpleNode.getAncestors().find(TypeGuards.isStatementedNode)
    if (firstStatementedNode) {
      firstStatementedNode.addStatements(`return ${returnValueString};`)
    }
    else {
      arg.log('addReturnStatement apply aborted because firstStatementedNode is null')
    }
  }
}