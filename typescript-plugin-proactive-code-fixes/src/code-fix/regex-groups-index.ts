// TODO: make it independent library

export function matchGlobalRegexWithGroupIndex(regex: RegExp, text: string): {value:string, start:number, end:number}[][] {
  let result
  let lastMatchIndex = 0
  const matches = []
  while ((result = regex.exec(text))) {
    const match = []
    lastMatchIndex = text.indexOf(result[0], lastMatchIndex)
    let relIndex = 0
    for (let i = 1; i < result.length; i++) {
      relIndex = text.indexOf(result[i], relIndex)
      match.push({ value: result[i], start: relIndex, end: relIndex + result[i].length })
    }
    matches.push(match)
  }
  return matches
}




// const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
// const text = `
// /***@
// debug.print('hello editor, simpleNode kind is ' +
// arg.simpleNode.getKindName())
// @***/
 
// const a = 1 //user

// /***@
// debug.print(arg.simpleNode.getParent().getKindName())
// @***/
// `
// const groupsWithIndex = matchGlobalRegexWithGroupIndex(regex, text)
// // console.log({groupsWithIndex})

// // now test - let's remove everything else but matched groups 
// let frag = '' 
// groupsWithIndex.forEach(match=>match.forEach(group=>{
//   console.log(group.start, group.end);

//   frag += text.substring(group.start, group.end) + '\n#######\n'
// }))
// console.log('Only matched groups\n#######\n', frag)



