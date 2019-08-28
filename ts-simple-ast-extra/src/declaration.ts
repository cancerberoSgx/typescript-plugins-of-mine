import { notUndefined } from 'misc-utils-of-mine-generic'
import { Node, Signature, Type } from 'ts-morph'

interface S {
  signature: Signature
  parameters: { name: string, optional?: boolean, type: Type, assign?: string }[]
  returnType: Type
  typeParameters: { name: string, optional?: boolean, type: Type, assign?: string }[]
}

interface PropertyDeclaration {
  name: string
  declaration: Node
  callSignatures: S[]
  constructorSignature: S[]
  type: Type
  jsdoc?: string
}

export function getProperties(t: Type): PropertyDeclaration[] {
  return t.getProperties().map(p => {
    const d = p.getValueDeclaration()
    if (!d) { return }
    return {
      name: p.getName(),
      type: d.getType(),
      declaration: d,
      callSignatures: d.getType().getCallSignatures().map(s => ({
        signature: s,
        returnType: s.getReturnType(),
        parameters: s.getParameters().map(p => {
          const d = p.getValueDeclaration()
          return {
            name: p.getName(),
            type: d ? d.getType() : p.getDeclaredType().getApparentType(),
            optional: d ? d.getType().isNullable() : p.getDeclaredType().isNullable() || false
          }
        }),
        typeParameters: [] as any,//TODO
        jsdoc: s.getDocumentationComments().map(d => d.getText()).join('\n')
      })),
      constructorSignature: []
    } as PropertyDeclaration
  }).filter(notUndefined)
}


// export function unifyDeclarations(index:SourceFile) : string{
//   if( !index.isDeclarationFile()){
//     throw new Error('Expected declaration files')
//   }
//   index.getStatementsWithComments().forEach(s=>{
//     if(TypeGuards.isExportDeclaration(s)){
//       if(!s.getChildrenOfKind(SyntaxKind.AsteriskToken)) {
//         throw new Error('Only star exports are supported (export * from)')
//       }
//       if(s.isModuleSpecifierRelative()) {

//       }
//       s.getChildrenOfKind(SyntaxKind.StringLiteral)
//       // s.getNamedExports()
//     }else {

//     }
//   })
// }
