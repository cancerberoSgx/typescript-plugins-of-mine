
// export interface Config {
//   prefix: string
// }
// export interface Action {
//   action: string
//   args: { [key: string]: string }
// }


// /**
//  * given a ts file content string will try to parse and return Actions found on it
//  * @param fileStr 
//  * @param position 
//  * @param config 
//  */
// export function findActions(fileStr: string, config: Config): Action[] {
//   const found: Action[] = []
//   // const lines = fileStr.split('\n') //TODO: use new line format in tsconfig
//   // lines.forEach(line => {
//   //   const i = line.indexOf(config.prefix)
//   //   if (i === -1) {
//   //     return
//   //   }
//   //   const userCall = line.substr(i + config.prefix.length, line.length)
//   //   try {
//   //     const result = eval(allActionsEvalPrefix + ';' + userCall)
//   //     if (result && typeof result === 'object') {
//   //       found.push(result)
//   //     }
//   //   } catch (ex) {
//   //   }
//   // })
//   // return found

//   // found.push({action:'moveThisFileTo', args: {dest: 'foo.ts'} })
//   return [{action:'moveThisFileTo', args: {dest: 'foo.ts'} }]
// }


// const allActionsEvalPrefix = `
// function moveThisFileTo(path){return {action: 'moveThisFileTo', args: {dest: path} }};
// function moveThisFolderTo(path){return {action: 'moveThisFolderTo', args: {dest: path} }};
// `

// const file1 = `
// import * as x from 'foo'
// // &%&% moveThisFileTo('/home/sg/git/proj1/src/model/units/Warrior.ts') 
// export function a (){}
// `
// const found = findActions(file1, { prefix: '&%&%' })
// console.log('found: ', found);
