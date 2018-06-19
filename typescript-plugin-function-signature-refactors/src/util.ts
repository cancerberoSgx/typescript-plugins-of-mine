import * as ts from 'typescript';
import { findAscendant, findChildContainingRangeLight, positionOrRangeToRange } from 'typescript-ast-util';
import { CallExpression, Node, ReferenceFindableNode, SignaturedDeclaration, TypeGuards } from "ts-simple-ast";
import { getChildrenForEachChild, getName } from "typescript-plugin-util";

export interface TargetInfo {
  name: string,
  targetNode: ts.Node,
  parameterCount: number,
  argumentCount: number
}

export function getTargetNode(sourceFile: ts.SourceFile, position: number): ts.Node {
  const target = findChildContainingRangeLight(sourceFile, positionOrRangeToRange(position));
  const predicate = (p: ts.Node) => ts.isCallSignatureDeclaration(p) || ts.isFunctionLike(p) || ts.isCallOrNewExpression(p) || ts.isMethodSignature(p) || ts.isConstructSignatureDeclaration(p)
  return findAscendant(target, predicate, true)
}

export function getTargetInfo(sourceFile: ts.SourceFile, position: number, predicate: (n: ts.Node) => boolean = n => true): TargetInfo | undefined {

  let targetNode = getTargetNode(sourceFile, position)
  if (!targetNode) {
    return
  }
  let parameterCount = 0, argumentCount = 0
  let name
  if (ts.isFunctionLike(targetNode)) {
    if (!predicate(targetNode)) {
      return
    }
    name = targetNode.name ? targetNode.name.getText() : (targetNode.parent && (targetNode.parent as any).name && (targetNode.parent as any).name) ? (targetNode.parent as any).name.getText() : undefined

    if (!name) {
      return
    }
    parameterCount = targetNode.parameters.length
  }
  else if (ts.isCallExpression(targetNode)) {
    if (!predicate(targetNode)) {
      return
    }
    if (!ts.isIdentifier(targetNode.expression)) {
      return
    }
    name = targetNode.expression.getText()
    argumentCount = targetNode.arguments.length
  }
  //TODO: isCallNew and others that comply with : ts.isCallSignatureDeclaration(p)||ts.isFunctionLike(p)||ts.isCallOrNewExpression(p
  else {
    // this.options.log('snippet undefined because not isCallExpression and not isFunctionLike' + targetNode.getText() + ' - ' + getKindName(targetNode))
    return
  }
  return { name, argumentCount, parameterCount, targetNode }
}



/**
 * collect al references of given node and returns those nodes that need to be refactored
 */
export function getAllCallsExpressions(targetDeclaration: Node & ReferenceFindableNode, log: (msg: string) => void): ((CallExpression | SignaturedDeclaration) & Node)[] {
  const calls: (Node & (CallExpression | SignaturedDeclaration))[] = []
  for (const referencedSymbol of targetDeclaration.findReferences()) {
    for (const reference of referencedSymbol.getReferences()) {
      const parent = reference.getNode().getParent()
      const extras = [parent, parent.getParent && parent.getParent(), targetDeclaration]
      const collection = (extras.concat(getChildrenForEachChild(parent)))
        .filter((value, pos, arr) => arr.indexOf(value) === pos)
      const found = collection
        .find(p =>
          (!getName(p) || getName(targetDeclaration) === getName(p)) &&
          (TypeGuards.isCallExpression(p) || TypeGuards.isSignaturedDeclaration(p))
        ) as (CallExpression | SignaturedDeclaration) & Node
      if (found) {
        calls.push(found)
      }
      else {
        log('getAllCallsExpressions ignoring reference parent: ' + parent.getKindName() +
          ' ref: ' + reference.getNode().getKindName() +
          ', chh ' + parent.getChildren().map(c => c.getKindName()).join(', ') +
          ' ancestors: ' + parent.getAncestors().map(c => c.getKindName()).join(', ')
        )
      }
    }
  }
  return calls.filter((value, pos, arr) => arr.indexOf(value) === pos)
}



export function applyToSignature(node: Node, fn: (argsOrParams: ReadonlyArray<Node>, returnValueOrType:Node)=>void, log: (msg: string) => void = console.log) {
  if (TypeGuards.isReferenceFindableNode(node)) {
    getAllCallsExpressions(node, log).forEach(call => {
      if (TypeGuards.isCallExpression(call)) {
        fn(call.getArguments(), null)
      }
      else {
        fn(call.getParameters(), null)
      }
    })
  }
  else {// if(TypeGuards.isConstructorDeclaration(node)) {
    log('!TypeGuards.isReferenceFindableNode(node) ' + node.getText());

    //TODO: find interface constructor implememted by this one and rename that one and then run this function calling it with node.getAncestors().find(TypeGuards.isReferenceFindableNode) to rename new A calls
    // return []
  }
}