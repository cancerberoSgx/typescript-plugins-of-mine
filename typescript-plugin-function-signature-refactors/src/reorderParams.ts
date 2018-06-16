import { CallExpression, NamedNode, SignaturedDeclaration, TypeGuards } from "ts-simple-ast";

function getAllCallsExpressions(f: NamedNode) {
  const referencedSymbols = f.findReferences()
  const calls: CallExpression[] = []
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      const parent = reference.getNode().getParent()
      if (TypeGuards.isCallExpression(parent)) {
        calls.push(parent)
      }
    }
  }
  return calls
}


/**
 * TODO: check that user is not removing parameters. For example, this is invalid in a three parameter function : [1, 2] 
 * because the first parameter will be removed. Or throw exception or touch the reorder argument so it contains them all 
 * @param targetDeclaration the function-like declaration to reorder its parameters
 * @param reorder [1,0] means switching the positions between first and second params
 */
export function reorderParameters(targetDeclaration: SignaturedDeclaration & NamedNode, reorder: number[]) {
  // targetDeclaration.getParameters()
  const allCalls = getAllCallsExpressions(targetDeclaration)
  function changeCallArgs (args: { getText: ()=>string, replaceWithText: (s:string)=>void} [] ) {
    let reorderedArgs: { index: number, arg: string }[] = []
    for (let i = 0; i < args.length; i++) {
      if(i>=reorder.length){
        continue
      }
      const arg = args[i];
      reorderedArgs.push({ index: reorder[i], arg: arg.getText() })
    }
    reorderedArgs.sort((a, b) => a.index < b.index ? -1 : 1)
    args.forEach((a, index) => {
      const arg = reorderedArgs.find(r => r.index === index)
      if (arg) {
        a.replaceWithText(arg.arg)
      }
    })
  }
  allCalls.forEach(call => {
    changeCallArgs(call.getArguments())
    changeCallArgs(targetDeclaration.getParameters())
    // for (let i = 0; i < args.length; i++) {
    //   if(i>=reorder.length){
    //     continue
    //   }
    //   const arg = args[i];
    //   reorderedArgs.push({ index: reorder[i], arg: arg.getText() })
    // }
    // reorderedArgs.sort((a, b) => a.index < b.index ? -1 : 1)
    // args.forEach((a, index) => {
    //   const arg = reorderedArgs.find(r => r.index === index)
    //   if (arg) {
    //     a.replaceWithText(arg.arg)
    //   }
    // })
  })
  // targetDeclaration
}



// /**
//  * @param targetDeclaration the function-like declaration to reorder its parameters
//  * @param reorderString higher level, 
//  */
// export function reorderParametersFromParamTextChanges(targetDeclaration: SignaturedDeclaration & NamedNode, reorder: string) {
//   targetDeclaration.getParameters()
//   const allCalls = getAllCallsExpressions(targetDeclaration)
//   allCalls.forEach(call => {
//     let reorderedArgs: { index: number, arg: string }[] = []
//     const args = call.getArguments()
//     for (let i = 0; i < args.length; i++) {
//       if(i>=reorder.length){
//         continue
//       }
//       const arg = args[i];
//       reorderedArgs.push({ index: reorder[i], arg: arg.getText() })
//     }
//     reorderedArgs.sort((a, b) => a.index < b.index ? -1 : 1)
//     call.getArguments().forEach((a, index) => {
//       const arg = reorderedArgs.find(r => r.index === index)
//       if (arg) {
//         a.replaceWithText(arg.arg)
//       }
//     })
//   })
// }
