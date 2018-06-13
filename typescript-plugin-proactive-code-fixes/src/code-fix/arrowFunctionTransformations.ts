import { ArrowFunction, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';

let description: string | undefined

/**

# Description

Implements the following kind of transformations related to arrow functions: 

 * add body to arrow function
 * remove body from arrow function
  
# TODO

 * config

*/
export const arrowFunctionBodyTransformations: CodeFix = {

  name: 'arrowFunctionTransformations',

  config: {
    // TODO: remove parameter list parenthesis if possible ?
    removeParamListParenthesis: true,
    // TODO: always add the inferred return type if none is declared
    addInferredReturnType: false
  },

  predicate: (options: CodeFixOptions): boolean => {
    description = undefined
    const arrow = findAscendant<ts.ArrowFunction>(options.containingTargetLight, ts.isArrowFunction, true)
    if (arrow && arrow.body.getChildren().find(c => c.kind === ts.SyntaxKind.OpenBraceToken)) {
      // means it has a body {}
      if (arrow.body.getChildren()[1].kind === ts.SyntaxKind.SyntaxList && arrow.body.getChildren()[1].getChildCount() > 1) {
        // Means it has more than one statement - meaning braces cannot be removed
      }
      else {
        description = DESCRIPTION_REMOVE_BODY
      }
    }
    else if(arrow){
      description = DESCRIPTION_ADD_BODY
    }
    return !!description
  },

  description: (options: CodeFixOptions): string => description,

  apply: (options: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {
    const simpleArrow: ArrowFunction | undefined = TypeGuards.isArrowFunction(options.simpleNode) ? options.simpleNode : options.simpleNode.getFirstAncestorByKind(ts.SyntaxKind.ArrowFunction)
    if (!simpleArrow) {
      options.log('apply aborted because no arrowFunction ancestor could be found')
      return
    }
    const hasTypeParameters = simpleArrow.getTypeParameters().length
    const parameterListMustHaveParen = hasTypeParameters || simpleArrow.getParameters().length != 1 || !!simpleArrow.getParameters()[0].getTypeNode()

    if (description === DESCRIPTION_REMOVE_BODY) {
      const firstChild = simpleArrow.getBody().getChildSyntaxList().getFirstChild()
      if (TypeGuards.isReturnStatement(firstChild)) {
        // TODO : ts-simple-ast dont support ArrowFunctionStructure, yet so we do it based on strings
        const newText =
          (hasTypeParameters ? '<' : '') + simpleArrow.getTypeParameters().map(tp => tp.getText()).join(', ') + (hasTypeParameters ? '>' : '') +
          (parameterListMustHaveParen ? '(' : '') + simpleArrow.getParameters().map(p => p.getText()).join(', ') + (parameterListMustHaveParen ? ')' : '') +
          (simpleArrow.getReturnTypeNode() ? ': ' + simpleArrow.getReturnTypeNode().getText() : '') + ' => ' + 
          (firstChild.getExpression().getKind() === ts.SyntaxKind.ObjectLiteralExpression ? ('(' + firstChild.getExpression().getText() + ')') : firstChild.getExpression().getText())

        options.log(`DESCRIPTION_REMOVE_BODY replacing old text ${simpleArrow.getText()} new text: ${newText}`)
        simpleArrow.replaceWithText(newText)
      } else {
        return // TODO: log
      }
    }
    else if (description === DESCRIPTION_ADD_BODY && simpleArrow.getEqualsGreaterThan() && simpleArrow.getEqualsGreaterThan().getNextSibling()) {
      // TODO : ts-simpleast dont support ArrowFunctionStructure, yet so we do it based on strings - we cannot do setBodyText because of an error...  
      const expression = simpleArrow.getEqualsGreaterThan().getNextSibling()
      const newText =
        (hasTypeParameters ? '<' : '') + simpleArrow.getTypeParameters().map(tp => tp.getText()).join(', ') + (hasTypeParameters ? '>' : '') +
        (parameterListMustHaveParen ? '(' : '') + simpleArrow.getParameters().map(p => p.getText()).join(', ') + (parameterListMustHaveParen ? ')' : '') +
        (simpleArrow.getReturnTypeNode() ? ': ' + simpleArrow.getReturnTypeNode().getText() : '') +
        ' => ' + ' { return ' +

        (TypeGuards.isParenthesizedExpression(expression) ? expression.getExpression().getText() : expression.getText()) + '; }'

      options.log(`DESCRIPTION_ADD_BODY replacing old text ${simpleArrow.getText()} new text: ${newText}`)
      simpleArrow.replaceWithText(newText)
    }
    else {
      options.log('apply not executed because node does not comply with description === DESCRIPTION_ADD_BODY && simpleArrow.getEqualsGreaterThan() && simpleArrow.getEqualsGreaterThan().getNextSibling(), simpleArrow.getText() === ' + simpleArrow.getText())
    }
  }
}
const DESCRIPTION_REMOVE_BODY = 'Remove body from arrow function'
const DESCRIPTION_ADD_BODY = 'Add body to arrow function'