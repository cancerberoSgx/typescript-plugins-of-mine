import { TypeGuards, Identifier } from 'ts-morph';
import * as ts from 'typescript';
import { getKindName, getTypeStringFor } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { buildRefactorEditInfo } from '../util';

/**

# description 

declares undeclared variables or functions 

# example

a=1 // before
const a = 1 // after

const result = nonDeclared(1,2,{a: 'g}) // before
// after:
function nonDeclared(arg1: number, arg2: number, arg3: {a: string}) {
  throw new Error('Not Implemented');
}
const result = nonDeclared(1,2,{a: 'g})

# attacks 

"code": "2304", Cannot find name 'b'.",

# TODO

 * issue : this `visitClass(c, buffer)` is transformed into this: 
  ```function visitClass(arg0: import("/home/sg/git/node-lucene/java2js/node_modules/javap/dist/types-ast").ClassDeclaration, arg1: string[]) {
    throw new Error('Not Implemented');
  }
  visitClass(c, buffer)```
  two issues there - the import and the args - use c and buffer instead of arg0 and arg1

  
 * if (existingProp && hasWrongSignature(existingProp, method)) -- is doing strange things on suggestion at hasWrongSignature

 * test with jsdoc or a trailing comment

 * Not offering for nonDeclared: ```afterEach(()=>{
    nonDeclared(config)
  })```

 * non declared methods and properties ? 

*/
export const codeFixCreateVariable: CodeFix = {

  name: 'Declare variable or function',

  config: { variableType: 'const' },

  predicate: (options: CodeFixOptions): boolean => {
    if (
      ts.isIdentifier(options.containingTarget) &&
      !ts.isTypeReferenceNode(options.containingTarget.parent) &&
      !ts.isNewExpression(options.containingTarget.parent) &&
      options.diagnostics.find(d => (d.code === 2304 || d.code === 2552) && d.start === options.containingTargetLight.getStart())) {
      return true
    }
    else {
      options.log(`predicate false because child.kind dont match ${getKindName(options.containingTargetLight.kind)}`)
      return false
    }
  },

  description: (options: CodeFixOptions) => `Declare "${options.containingTargetLight.getText()}"`,

  apply: (options: CodeFixOptions) => {
    const parent = options.simpleNode.getParent()

    const container = parent.getFirstAncestorByKind(ts.SyntaxKind.Block) || options.simpleNode.getSourceFile()
    const statementAncestor = parent.getAncestors().find(a => a.getParent() === container) || options.simpleNode.getSourceFile()

    if (TypeGuards.isIdentifier(options.simpleNode) && TypeGuards.isCallExpression(parent) && TypeGuards.isIdentifier(parent.getExpression()) && parent.getExpression().getText() === options.simpleNode.getText()) {

      const functionName = options.simpleNode.getText()
      const functionArguments = parent.getArguments().map((a, index) => {
        const type = options.simpleProject.getTypeChecker().getTypeAtLocation(a).getBaseTypeOfLiteralType().getText()
        return `arg${index}: ${type}`
      })
      const t = options.simpleProject.getTypeChecker().getContextualType(options.simpleNode.getFirstAncestorByKindOrThrow(ts.SyntaxKind.CallExpression))
      const returnType = t ? t.getText() : 'any'
      const functionText = `
function ${functionName}(${functionArguments.join(', ')}): ${returnType} {
  throw new Error('Not Implemented');
}
`

      if (!TypeGuards.isPropertyAccessExpression(parent.getChildAtIndex(0))) {
        // it's function call and the function is not a member i.e bar()
        return buildRefactorEditInfo(options.sourceFile, functionText, statementAncestor.getStart())
      }
      else {
        // it's a function call and the function is a member, i.e : foo.bar() - this is tackled by another fix: declareMember
      }
    }
    else {
      // its non function variable
      if (TypeGuards.isBinaryExpression(options.simpleNode.getParentOrThrow()) && TypeGuards.isStatement(options.simpleNode.getParentOrThrow().getParentOrThrow())) {
        // is an expression like a=1 we only preppend 'let '
        return buildRefactorEditInfo(options.sourceFile, `let `, options.simpleNode.getStart())
      }
      else {
        // otherwhise we create a new statement 'let a' at the top
        return buildRefactorEditInfo(options.sourceFile, `let ${(options.simpleNode as Identifier).getText()};\n`, statementAncestor.getStart())
      }
    }
  }
}

const acceptedParentKinds = [ts.SyntaxKind.BinaryExpression, ts.SyntaxKind.CallExpression]