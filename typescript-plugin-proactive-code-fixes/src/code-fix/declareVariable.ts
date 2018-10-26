import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName, getTypeStringFor } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

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
      (
        acceptedParentKinds.includes(options.containingTarget.kind) ||
        options.containingTarget.parent && acceptedParentKinds.includes(options.containingTarget.parent.kind) ||
        options.containingTarget.parent && options.containingTarget.parent.parent && acceptedParentKinds.includes(options.containingTarget.parent.parent.kind)
      ) &&
      options.diagnostics.find(d => d.code === 2304 && d.start === options.containingTargetLight.getStart())) {
      return true
    }
    else {
      options.log(`predicate false because child.kind dont match ${getKindName(options.containingTargetLight.kind)}`)
      return false
    }
  },

  description: (options: CodeFixOptions) => `Declare "${options.containingTargetLight.getText()}"`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const parent = options.simpleNode.getParent()
    if (TypeGuards.isIdentifier(options.simpleNode) && TypeGuards.isCallExpression(parent)) {
      // it's function call
      const expression = parent.getExpression()
      if (TypeGuards.isIdentifier(expression)) {
        const container = parent.getFirstAncestorByKind(ts.SyntaxKind.Block) || parent.getSourceFile()
        const statementAncestor = parent.getAncestors().find(a => a.getParent() === container)//TypeGuards.isStatement)
        if (statementAncestor && container) {
          const functionName = options.simpleNode.getText()
          const typeChecker = options.simpleProject.getTypeChecker()
          const functionArguments= parent.getArguments().map((a, index) => {
            return `arg${index}: ${getTypeStringFor(a.compilerNode, options.program)}`
          })
          const returnType = options.simpleProject.getTypeChecker().getContextualType(options.simpleNode.getFirstAncestorByKindOrThrow(ts.SyntaxKind.CallExpression)).getText()
          container.insertStatements(statementAncestor.getChildIndex(), `
function ${functionName}(${functionArguments.join(', ')}): ${returnType} {
  throw new Error('Not Implemented');
}
`
          )
        } // TODO: LOG else
      }// TODO: LOG else
    }
    else {
      // it's a variable declaration
      options.simpleNode.getSourceFile().insertText(options.simpleNode.getStart(), 'const ')
    }
  }
}

const acceptedParentKinds = [ts.SyntaxKind.BinaryExpression, ts.SyntaxKind.CallExpression]