import { notUndefined } from 'misc-utils-of-mine-generic'
import { Identifier, Node, SyntaxKind, TypeGuards } from 'ts-morph'

export function getDefinitionsOf(id: Identifier) {
  return id
    .findReferences()
    .map(r =>
      r
        .getDefinition()
        .getNode()
        .getParent()
    )
    .filter(notUndefined)
}

interface ExternalTypeReferences {
  node: Node
  origin?: 'any' | 'unknown' | 'external' | 'internal'
}

/**
 * Returns all ReferenceTypes in given node, optionally filtering them by declaration origin. 
 */
export function getTypeReferencesByDefinitionOrigin(o: ExternalTypeReferences) {
  return o.node.getDescendantsOfKind(SyntaxKind.TypeReference)
    .filter(r => {
      if (!o.origin || o.origin === 'any') {
        return true
      }
      try {
        const typeName = r.getTypeName()
        const name = TypeGuards.isIdentifier(typeName) ? typeName : typeName.getRight()

        const definitions = name.getDefinitions()
        // console.log(definitions.map(d => d.getContainerName()));
        // console.log(name.getText(), r.getParent().getText(), name.getDefinitionNodes().map(d => d.getText()+' - '+d.getSourceFile().getSourceFile().getBaseName()));

        // const defs = definitions[] .map(d=>d.getDeclarationNode)
        if (o.origin === 'unknown') {
          return definitions.length === 0 || definitions.find(d => !d.getSourceFile())// === o.node.getSourceFile())
        }
        if (o.origin === 'external') {
          return !definitions.find(d => d.getSourceFile() === o.node.getSourceFile())
        }
        else if (o.origin === 'internal') {
          return definitions.length && !definitions.find(d => d.getSourceFile() !== o.node.getSourceFile())
        }
        // else if (o.origin === 'partiallyExternal') {
        //   return name.getDefinitionNodes().find(d => d.getSourceFile() !== o.node.getSourceFile())
        // }
        // else if (o.origin === 'partiallyInternal') {
        //   return name.getDefinitionNodes().find(d => d.getSourceFile() === o.node.getSourceFile())
        // }
        // if (){

        // }else {
        //   name.get
        // }
        // const s = r.getSymbol()
        // // if(!internal){
        // return s ? s.getDeclarations().find(d=>d.getSourceFile()!==node.getSourceFile()) : true
        // }
        // else {
        // return s ? s.getDeclarations().find(d=>d.getSourceFile()===node.getSourceFile()) : false
        // } 
      } catch (error) {
        return o.origin === 'unknown'
      }
    })
    .filter(notUndefined)
}
// /**
//  * Returns all ReferenceTypes in given node that are declared in its source file
//  */
// export function getInternalTypeReferences(node: Node) {
//   var external = getExternalTypeReferences(node)
//   return node.getDescendantsOfKind(SyntaxKind.TypeReference).
//     filter(r => !external.find(e => e.getText() === r.getText()))
//     .filter(notUndefined)
// }
