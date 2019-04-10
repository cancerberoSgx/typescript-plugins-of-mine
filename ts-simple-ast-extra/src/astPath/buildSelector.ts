import { Node, TypeGuards } from 'ts-morph'
import { getChildrenForEachChild, getChildrenByPassSyntaxList } from '../node'
import { AstPath, ASTPathNode, BuildAstPathOptions } from './types'
/**
 * Creates a selector like `0/4/3/` where numbers are the child index of the node on that level with respect
 * to the parent (getChildIndex()), starting from the sourceFile.
 *
 * TODO. add a second destination node that by default is the SourceFile
 *
 * TODO: we can include extra node attribute information like id, name, or the type (:statement, :expression, :declaration, :function, or :pattern) so we can generate richer - human path strings representations and have more ways of validating the path
 *
 * In particular nested attributes is interesting in tsquery since we can search for names inheritance, etc : Identifier[name="Animal"], IfStatement:has([name="foo"]), TODO: investigate
 *
 * )
 */
export function buildAstPath(
  node: Node,
  fromAncestor: Node = node.getSourceFile(),
  options: BuildAstPathOptions = {}
): AstPath {
  let path: ASTPathNode[] = []
  let list = node.getAncestors()
  if (!TypeGuards.isSourceFile(fromAncestor)) {
    list.splice(0, list.findIndex(node => node === fromAncestor))
  }
  ;[...list.reverse(), node].forEach(a => {
    //  let index:number
    let parent: Node | undefined = a.getParent()
    //  if(!parent){
    //    index=0
    //  }
    //  else if(options.mode==='getChildren') {
    //   // parent  = TypeGuards.isSyntaxList(parent)
    //  }
    const index = parent
      ? (options.mode === 'getChildren'
          ? getChildrenByPassSyntaxList(parent)
          : getChildrenForEachChild(parent)
        ).findIndex(c => c === a)
      : 0
    path.push({
      index,
      ...(options.includeNodeKind ? { nodeKind: a.getKind(), parentKind: parent ? parent!.getKind() : undefined } : {})
    })
  })
  return {
    path,
    createOptions: options
  }
}
