import { ExportableNode, Node, Project, ReferenceEntry, ReferenceFindableNode, SourceFile, TypeGuards } from 'ts-simple-ast';
import { flat } from 'typescript-ast-util';
import { NodeType } from './moveNode';

export function addImportsToDestFile(node: Node, destFile: SourceFile) {
  const importsToAddToDestFile = node.getSourceFile().getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() !== destFile).map(i => {
    const specifiedFile = i.getModuleSpecifierSourceFile() 
    const isLibrary = !specifiedFile || !i.getModuleSpecifierValue().trim().startsWith('.')
    const moduleSpecifier =  isLibrary ? i.getModuleSpecifierValue() : destFile.getRelativePathAsModuleSpecifierTo(specifiedFile) 
      return {
        ...i.getStructure(),
        moduleSpecifier
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




export function addImportsToReferencingFiles(node: NodeType, destFile: SourceFile) {
  const referencedSourceFiles = getReferences(node).map(r => r.getSourceFile()).filter((f, i, a) => a.indexOf(f) === i);
  referencedSourceFiles.forEach(f => {
    const newImports = f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile()).map(i => ({
      ...i.getStructure(),
      moduleSpecifier: f.getRelativePathAsModuleSpecifierTo(destFile)
    }));
    f.addImportDeclarations(newImports);
    f.getImportDeclarations().filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile()).forEach(i => i.remove());
  });
  node.getSourceFile().addImportDeclaration({
    moduleSpecifier: node.getSourceFile().getRelativePathAsModuleSpecifierTo(destFile),
    namedImports: [{ name: node.getName() }]
  });
}


let tmpSourceFile: SourceFile

export function safeOrganizeImports(f: SourceFile, project: Project) {
  if(!tmpSourceFile){
    tmpSourceFile= project.createSourceFile('tmp.ts', '')
  }
  tmpSourceFile.replaceWithText(f.getText())
  tmpSourceFile.organizeImports()
  f.replaceWithText(tmpSourceFile.getText())
}

export function getReferences(node: ReferenceFindableNode): ReferenceEntry[] {
  const references: ReferenceEntry[] = []
  const referencedSymbols = node.findReferences();
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      references.push(reference)
    }
  }
  return references
}

export function findReferencesDeclaredOutside(node: Node, outside: boolean = true): Node[] {
  const refs = node.getDescendants().filter(TypeGuards.isReferenceFindableNode)
    .map(d => {
      return getReferences(d)
        .filter(r => r.isDefinition() && (outside ? !r.getNode().getFirstAncestor(a => a === node) : !!r.getNode().getFirstAncestor(a => a === node))).map(r => r.getNode())
    })
  return flat(refs).filter((n, i, a) => a.indexOf(n) === i)
}

