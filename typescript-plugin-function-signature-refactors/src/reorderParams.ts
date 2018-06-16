import { CallExpression, NamedNode, SignaturedDeclaration, TypeGuards, Node, NameableNode, ReferenceFindableNode, ParameterDeclaration } from "ts-simple-ast";
// import { ParameterDeclaration } from "../../typescript-ast-util/node_modules/typescript/lib/tsserverlibrary";

function getAllCallsExpressions(targetDeclaration: ReferenceFindableNode&Node): ((CallExpression | SignaturedDeclaration) & Node)[] {
  const referencedSymbols = targetDeclaration.findReferences()
  const calls: (Node & (CallExpression | SignaturedDeclaration))[] =  []
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      const parent = reference.getNode().getParent()
      const extras = [parent, parent.getParent && parent.getParent(), targetDeclaration]
      // if(TypeGuards.isPropertyAccessExpression(parent)&& parent.getParent() && !extras.includes(parent.getParent())){
      //   extras.push(parent.getParent())
      // }
      // if( (TypeGuards.isCallExpression(targetDeclaration) || TypeGuards.isSignaturedDeclaration(targetDeclaration))&& !extras.includes(targetDeclaration)){
      //   extras.push(targetDeclaration)
      // }
      const found =(extras
        // .filter((value, pos, arr)=>arr.indexOf(value)===pos)
        .concat(getChildrenForEachChild(parent)))
        .filter((value, pos, arr)=>arr.indexOf(value)===pos)
        .find(p=>
        // !console.log(p.getKindName()) &&
        (!getName(p)||getName (targetDeclaration)===getName(p)) && 
        
          (TypeGuards.isCallExpression(p) || TypeGuards.isSignaturedDeclaration(p))
        ) as  (CallExpression | SignaturedDeclaration) & Node
      if (found) {
        calls.push(found)
      }
      else {
        console.log('getAllCallsExpressions ignoring reference parent: '+parent.getKindName()+
        ' ref: '+reference.getNode().getKindName() + 
        'chh '+parent.getChildren().map(c=>c.getKindName() ).join(', ') + 
        ' ancest: '+parent.getAncestors().map(c=>c.getKindName() ).join(', ')
        )
      }
    }
  }
  // console.log(calls.map(c=>c.getSourceFile().getFilePath()+'-'+c.getText()), )
  return calls
    .filter((value, pos, arr)=>arr.indexOf(value)===pos)
}


/**
 * TODO: check that user is not removing parameters. For example, this is invalid in a three parameter function : [1, 2] 
 * because the first parameter will be removed. Or throw exception or touch the reorder argument so it contains them all 
 * @param targetDeclaration the function-like declaration to reorder its parameters
 * @param reorder [1,0] means switching the positions between first and second params
 */
export function reorderParameters(targetDeclaration:ReferenceFindableNode&Node, reorder: number[]) {
  // if(targetDeclaration)
  getAllCallsExpressions(targetDeclaration).forEach(call => {
    if (TypeGuards.isCallExpression(call)) {
      changeCallArgs(reorder, call.getArguments())
    }
    // else if (TypeGuards.isSignaturedDeclaration(call)) {
      else {
      changeCallArgs(reorder, call.getParameters())
    }
    // else {
    //   console.log('reorderParameters ignoring call: '+call.getKindName())
    // }
    // if(TypeGuards.isSignaturedDeclaration(targetDeclaration)){
    //   changeCallArgs(reorder, targetDeclaration.getParameters())
    // }
  })
}

function changeCallArgs(reorder: ReadonlyArray<number>, args: ReadonlyArray<Node>) {
  type T = { index: number, arg: string, name:string }
  // let indexOccupied = [].concat(reorder).concat(new Array(args.length-reorder.length).fill(-1)).sort()
  let indexOccupied  = new Array(args.length).fill(-1)
  reorder.forEach((r, i)=>{
    if(r>=indexOccupied.length){
      //user error provided incorrect reorder array
    }
    indexOccupied[r] = i
  })
  function findNextFreeIndexFor(index){
    const id = indexOccupied.indexOf(-1)
    indexOccupied[id] =index
    return id
  }
  let reorderedArgs: T[] = args.map((arg, i)=>{
    if (i < reorder.length) {
      return { 
        index: reorder[i], 
        arg: arg.getText(), 
        name: getName(arg)
      }
    }
  }).filter(a => !!a)
  reorderedArgs.sort((a, b) => a.index < b.index ? -1 : 1)
  const missingArgs: T[]  = args.map( (arg, index) => {
    // if (!reorder.includes(index)){ 
      if (index>=reorder.length){ 
     const newIndex = findNextFreeIndexFor(index)
      // const targetArg =  findNextFreeIndexFor(index)
      return { 
        index: newIndex, 
        arg: arg.getText() ,
        name: getName(arg)
      }
    }
  }).filter(a => !!a)

  // console.log(
  //   args[0].getParent().getKindName(), reorder, 
  // 'reorderedArgs', reorderedArgs.map(a=>a.index+'-'+a.name), 
  // 'missingArgs', missingArgs.map(a=>a.index+'-'+a.name) + '-'+args[0].getSourceFile().getFilePath())

  reorderedArgs = reorderedArgs.concat(missingArgs)
  // console.log(args[0].getSourceFile().getFilePath(), reorderedArgs, missingArgs)
      // 'reorderedArgs', reorderedArgs.map(a=>a.index))


  const replacements = []
  args.forEach((a, index) => {
    const arg = reorderedArgs.find(r => r.index === index)
    // if (arg) {
      // if (args[reorderedArgs[index].index]) {
        // const arg =  reorderedArgs[index]//.index
        if (arg) {
      // const prev =  `${a.getSourceFile().getFilePath()}  ${a.getText()} is replaced with =>> ${arg.arg} `
      replacements.push({node: args[arg.index], text: arg.arg})
      // a.replaceWithText(arg.arg)
      // console.log(`${a.getSourceFile().getFilePath()}  ${a.getText()} is replaced with =>> ${arg.arg} `);
    }else {
      console.log('changeCallArgs ignoring arg: '+a.getKindName() + ' - text: '+a.getText())
    }
  })
  for (const r of replacements) {
    r.node.replaceWithText(r.text)
  }

}






function getChildrenForEachChild(n:Node): Node[]{
  const result : Node[]= []
  n.forEachChild(n=>result.push(n))
  return result
}

function getName(n: Node){
  return (n as any).getName ? ((n as any).getName()+'') : ''
} 