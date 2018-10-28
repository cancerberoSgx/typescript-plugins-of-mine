import { Node, SourceFile, ReferenceEntry, Project, ClassDeclaration, TypeGuards, Statement, ReferenceFindableNode, InterfaceDeclaration, FunctionDeclaration, EnumDeclaration } from 'ts-simple-ast'

// TODO: 
// * make sure moved node is exported and is imported in nodeFile
// * enumDeclaration , variable declarations
// * import all references used by node
export function moveNode(node: ClassDeclaration | InterfaceDeclaration | FunctionDeclaration, destFile: SourceFile) {
  const nodeFile = node.getSourceFile()
  const references = getReferences(node)

  const nodeFileImports = nodeFile.getImportDeclarations()

  // we copy all the imports from nodeFile to destFile and the organize imports so the moved declaration don't miss any import
  // TODO: class declaration maybe using references to nodes inside destFile non exported or imported
  destFile.addImportDeclarations(nodeFileImports.filter(i => i.getModuleSpecifierSourceFile() !== destFile).map(i => {
    return {
      ...i.getStructure(),
      moduleSpecifier: destFile.getRelativePathAsModuleSpecifierTo(i.getModuleSpecifierSourceFile())
    }
  })
  )
  // For each referenced sourceFile  - each import that references the nodeFile we duplicate them fixing the target path to dest.
  const referencedSourceFiles = references.map(r => r.getSourceFile()).filter((f, i, a) => a.indexOf(f) === i)
  console.log('referencedSourceFiles: ' + referencedSourceFiles.map(r => r.getBaseName()).join('\n'));
  referencedSourceFiles.forEach(f => {
    const newImports = f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === nodeFile).map(i =>
      ({
        ...i.getStructure(),
        moduleSpecifier: f.getRelativePathAsModuleSpecifierTo(destFile)
      })
    )
    f.addImportDeclarations(newImports)
    f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === nodeFile).forEach(i => i.remove())
  })

  // move the declaration
  if (TypeGuards.isClassDeclaration(node)) {
    destFile.addClass(node.getStructure())
  }
  else if (TypeGuards.isInterfaceDeclaration(node)) {
    destFile.addInterface(node.getStructure())
  }
  else if (TypeGuards.isFunctionDeclaration(node)) {
    destFile.addFunction(node.getStructure())
  }
  node.remove()
  destFile.organizeImports()
  nodeFile.organizeImports()
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
