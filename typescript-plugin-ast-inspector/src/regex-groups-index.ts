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

