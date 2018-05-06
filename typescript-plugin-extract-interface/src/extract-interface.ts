import * as ts from 'typescript'
// import * as ts_module from '../node_modules/typescript/lib/tsserverlibrary'

export function extractInterface(node: ts.ClassDeclaration): string {
  node.members.forEach(member=>{

  })
  return `export interface I${node.name} {
bla bla
}`
}