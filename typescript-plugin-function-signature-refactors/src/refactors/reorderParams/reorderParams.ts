import { Node, TypeGuards } from "ts-simple-ast";
import { getName } from "typescript-plugin-util";
import { getAllCallsExpressions, applyToSignature } from '../../util';

// this file isolates the AST implementation from plugin logic


/**
 * For all references that must be refactored calls changeCallArgs.
 * 
 * TODO: check that user is not removing parameters. For example, this is invalid in a three 
 * parameter function : [1, 2] 
 * because the first parameter will be removed. Or throw exception or touch the reorder argument so it contains them all 
 * @param targetDeclaration the function-like declaration to reorder its parameters
 * @param reorder [1,0] means switching the positions between first and second params
 */
export function reorderParameters(node: Node, reorder: number[], log: (msg: string) => void):void {

  applyToSignature(node, (argsOrParams: ReadonlyArray<Node>) => changeCallArgs(reorder, argsOrParams, log), log)

  // if (TypeGuards.isReferenceFindableNode(node)) {
  //   getAllCallsExpressions(node, log).forEach(call => {
  //     if (TypeGuards.isCallExpression(call)) {
  //       changeCallArgs(reorder, call.getArguments(), log)
  //     }
  //     else {
  //       changeCallArgs(reorder, call.getParameters(), log)
  //     }
  //   })
  // }
  // else {// if(TypeGuards.isConstructorDeclaration(node)) {
  //   log('!TypeGuards.isReferenceFindableNode(node) ' + node.getText());

  //   //TODO: find interface constructor implememted by this one and rename that one and then run this function calling it with node.getAncestors().find(TypeGuards.isReferenceFindableNode) to rename new A calls
  //   // return []
  // }
}

function changeCallArgs(reorder: ReadonlyArray<number>, args: ReadonlyArray<Node>, log: (msg: string) => void) {
  type T = { index: number, arg: string, name: string }

  // will use indexOccupied to reassign new positions to those nodes that must move implicitly
  let indexOccupied = new Array(args.length).fill(-1)
  reorder.forEach((r, i) => {
    if (r >= indexOccupied.length) {
      //user error provided incorrect reorder array
    }
    indexOccupied[r] = i
  })
  function findNextFreeIndexFor(index: number) {
    const id = indexOccupied.indexOf(-1)
    indexOccupied[id] = index
    return id
  }
  // reorderedArgs will have metadata regarding the new params/args locations
  let reorderedArgs: T[] = args.map((arg, i) => {
    if (i < reorder.length) {
      return {
        index: reorder[i],
        arg: arg.getText(),
        name: getName(arg)
      }
    }
  }).filter(a => !!a)

  // missingArgs contains  metadata regarding those nodes that must implicitly move
  const missingArgs: T[] = args.map((arg, index) => {
    if (index >= reorder.length) {
      const newIndex = findNextFreeIndexFor(index)
      return {
        index: newIndex,
        arg: arg.getText(),
        name: getName(arg)
      }
    }
  }).filter(a => !!a)
  reorderedArgs = reorderedArgs.concat(missingArgs)
  // store movements metadata here so we move all together at the end (performance - avoid conflicts)
  const replacements: {node: Node, text: string}[] = []
  args.forEach((a, index) => {
    const arg = reorderedArgs.find(r => r.index === index)
    if (arg) {
      replacements.push({ node: args[arg.index], text: arg.arg })
    } else {
      log('changeCallArgs ignoring arg: ' + a.getKindName() + ' - text: ' + a.getText())
    }
  })
  for (const r of replacements) {
    r.node.replaceWithText(r.text)
  }
}
