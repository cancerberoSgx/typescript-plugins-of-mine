import { Node, SourceFile, ReferenceEntry, Project, ClassDeclaration, TypeGuards, Statement, ReferenceFindableNode, InterfaceDeclaration, FunctionDeclaration, EnumDeclaration, ExportableNode } from 'ts-simple-ast'

// TODO: 
// * make sure moved node is exported and is imported in node.getSourceFile()
// * enumDeclaration , variable declarations
// *
export type NodeType = ClassDeclaration | InterfaceDeclaration | FunctionDeclaration
export function moveNode(node: NodeType, destFile: SourceFile) {

  // we copy all the imports from node.getSourceFile() to destFile and the organize imports so the moved declaration don't miss any import
  addImportsToDestFile(node, destFile);

  // For each sourceFile that reference node, we add an import declaration to node but specifying nodeFile. (we "move" the oriinal import declarations only changing the specifier to point to destFile).
  const referencedSourceFiles = getReferences(node).map(r => r.getSourceFile()).filter((f, i, a) => a.indexOf(f) === i)
  referencedSourceFiles.forEach(f => {
    const newImports = f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile()).map(i =>
      ({
        ...i.getStructure(),
        moduleSpecifier: f.getRelativePathAsModuleSpecifierTo(destFile)
      })
    )
    f.addImportDeclarations(newImports)
    f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile()).forEach(i => i.remove())
  })

  // move the declaration
  let finalNode: NodeType
  if (TypeGuards.isClassDeclaration(node)) {
    finalNode = destFile.addClass(node.getStructure())
  }
  else if (TypeGuards.isInterfaceDeclaration(node)) {
    finalNode =destFile.addInterface(node.getStructure())
  }
  else if (TypeGuards.isFunctionDeclaration(node)) {
    finalNode =destFile.addFunction(node.getStructure())
  }
  node.remove()

  finalNode.setIsExported(true)
  destFile.organizeImports()
  node.getSourceFile().organizeImports()
}

function getReferences(node: ReferenceFindableNode): ReferenceEntry[] {
  const references: ReferenceEntry[] = []
  const referencedSymbols = node.findReferences();
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      references.push(reference)
    }
  }
  return references
}

import { flat } from 'typescript-ast-util'
export function findReferencesDeclaredOutside(node: Node, outside: boolean = true): Node[] {
  const refs = node.getDescendants().filter(TypeGuards.isReferenceFindableNode)
    .map(d => {
      return getReferences(d)
        .filter(r => r.isDefinition() && (outside ? !r.getNode().getFirstAncestor(a => a === node) : !!r.getNode().getFirstAncestor(a => a === node))).map(r => r.getNode())
    })
  return flat(refs).filter((n, i, a) => a.indexOf(n) === i)
}



export function addImportsToDestFile(node: Node, destFile: SourceFile){
  const importsToAddToDestFile = node.getSourceFile().getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() !== destFile).map(i => {
    return {
      ...i.getStructure(),
      moduleSpecifier: destFile.getRelativePathAsModuleSpecifierTo(i.getModuleSpecifierSourceFile())
    }
  })
   // import all nodes used by node that are declared outside it but not imported . Make sure they are exported
  const referencedByNodeNotImported = findReferencesDeclaredOutside(node)
  .filter(r=>r.getSourceFile()===node.getSourceFile() && !r.getFirstAncestor(TypeGuards.isImportDeclaration))
  .map(n=>{
    const exportableAncestor = n.getFirstAncestor(a=>TypeGuards.isExportableNode(a) && TypeGuards.isNameableNode(a) && a.getName() === n.getText()) as any as ExportableNode
    if(exportableAncestor){
      exportableAncestor.setIsExported(true)
    }
    return n
  })
  .filter((n,i,a)=>a.indexOf(n)===i)
  referencedByNodeNotImported.forEach(n=>{
    importsToAddToDestFile.push({
      moduleSpecifier:  destFile.getRelativePathAsModuleSpecifierTo(node.getSourceFile()),
      namedImports: [{name: n.getText()}]
    })
  })

  destFile.addImportDeclarations(importsToAddToDestFile )

}