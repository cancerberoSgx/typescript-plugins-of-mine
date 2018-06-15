import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
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

 * if (existingProp && hasWrongSignature(existingProp, method)) -- is doing strange things on suggestion at hasWrongSignature

 * test with jsdoc or a trailing comment

 * Not offering for nonDeclared: ```afterEach(()=>{
    nonDeclared(config)
  })```

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

  description: (options: CodeFixOptions) => `Declare variable "${options.containingTargetLight.getText()}"`,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const parent = options.simpleNode.getParent()
    if (TypeGuards.isIdentifier(options.simpleNode) && TypeGuards.isCallExpression(parent)) {
      const expression = parent.getExpression()
      if (TypeGuards.isIdentifier(expression)) {
        const container = parent.getFirstAncestorByKind(ts.SyntaxKind.Block) || parent.getSourceFile()//.sourceFile
        const statementAncestor = parent.getAncestors().find(a => a.getParent() === container)//TypeGuards.isStatement)
        if (statementAncestor && container) {
          container.insertStatements(statementAncestor.getChildIndex(), `function ${options.simpleNode.getText()}(${parent.getArguments().map((a, index) => 'arg' + index + ': ' + a.getType().getText()).join(', ')}){
            throw new Error('Not Implemented');
          }`)
        } // LOG else
      }// LOG else
    }
    else {
      // it's a variable declaration
      options.simpleNode.getSourceFile().insertText(options.simpleNode.getStart(), 'const ')
    }

  }
}

const acceptedParentKinds = [ts.SyntaxKind.BinaryExpression, ts.SyntaxKind.CallExpression]