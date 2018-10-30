import { ExportableNode, Node, Project, ReferenceEntry, ReferenceFindableNode, SourceFile, TypeGuards, ImportSpecifierStructure } from 'ts-simple-ast';
import { flat } from 'typescript-ast-util';
import { NodeType } from './moveNode';
import { createProject } from '../spec/testUtil';

export function fixImportsInDestFile(node: NodeType, destFile: SourceFile) {
  const importsToAddToDestFile = node.getSourceFile().getImportDeclarations()
    .filter(i => i.getModuleSpecifierSourceFile() !== destFile)
    .map(i => {
      const specifiedFile = i.getModuleSpecifierSourceFile()
      const isLibrary = !specifiedFile || !i.getModuleSpecifierValue().trim().startsWith('.')
      const moduleSpecifier = isLibrary ? i.getModuleSpecifierValue() : destFile.getRelativePathAsModuleSpecifierTo(specifiedFile)
      return {
        ...i.getStructure(),
        moduleSpecifier
      }
    })
  // import all nodes used by node that are declared outside it but not imported . Make sure they are exported
  const referencedByNodeNotImported = findReferencesDeclaredOutside(node)
    .filter(r => r.getSourceFile() === node.getSourceFile() && !r.getFirstAncestor(TypeGuards.isImportDeclaration))
    .map(n => {
      const exportableAncestor = n.getFirstAncestor(a => TypeGuards.isExportableNode(a) && TypeGuards.isNameableNode(a) && a.getName() === n.getText()) as any as ExportableNode
      if (exportableAncestor) {
        exportableAncestor.setIsExported(true)
      }
      return n
    })
    .filter((n, i, a) => a.indexOf(n) === i)
  referencedByNodeNotImported.forEach(n => {
    importsToAddToDestFile.push({
      moduleSpecifier: destFile.getRelativePathAsModuleSpecifierTo(node.getSourceFile()),
      namedImports: [{ name: n.getText() }]
    })
  })

  destFile.addImportDeclarations(importsToAddToDestFile)
}



export function fixImportsInReferencingFiles(node: NodeType, destFile: SourceFile) {
  getReferences(node)
    .map(r => r.getSourceFile())
    .filter((f, i, a) => a.indexOf(f) === i)
    .forEach(f => {
      const newImports = f.getImportDeclarations()
        .filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile())
        .map(i => {
          const s = i.getStructure()
          // get the named import but only for node (in case there are multiple names in the import we remove the others)
          let namedImports
          if (s.namedImports && Array.isArray(s.namedImports)) {
            namedImports = s.namedImports.filter(ni => typeof (ni) === 'string' ? ni === node.getName() : ni.name === node.getName())
          }
          else if (s.namedImports) {
            namedImports = [{ name: node.getName() }] // and good luck!
            //TODO: what is the case when namedImports is of type writerFunction, not an array ? how do I handle that ? - an structure shound be serializable and here a field can be a function !!! 
          }
          return {
            ...s,
            moduleSpecifier: f.getRelativePathAsModuleSpecifierTo(destFile),
            namedImports
          }
        })
      f.addImportDeclarations(newImports);
      f.getImportDeclarations()
        .filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile())
        .forEach(i => {
          if (i.getNamedImports() && i.getNamedImports().length > 1) {
            const ni = i.getNamedImports().find(ni => ni.getName() === node.getName())
            if (ni) {
              ni.remove()
            }
          }
          else {
            i.remove()
          }
        })
    })
  node.getSourceFile().addImportDeclaration({
    moduleSpecifier: node.getSourceFile().getRelativePathAsModuleSpecifierTo(destFile),
    namedImports: node.isDefaultExport() ? undefined : [{ name: node.getName() }],
    defaultImport: node.isDefaultExport() ? node.getName() : undefined,
  })
}



// fixes those files that contain export * from 'nodeFile' - heads up we need to go file by file because these doesn't contain references to the node
export function fixExportsInReferencingFiles(node: NodeType, destFile: SourceFile, project: Project) {
  project.getSourceFiles()
    .forEach(f => {
      f.getExportDeclarations()
        .filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile())
        .forEach(i => {
          const ne = i.getNamedExports().find(ne => ne.getName() === node.getName())
          if (ne) {
            ne.remove()
          }
          const isLibrary = !i.getModuleSpecifierSourceFile() || !i.getModuleSpecifierValue().trim().startsWith('.')
          const moduleSpecifier = isLibrary ? i.getModuleSpecifierValue() : i.getModuleSpecifierSourceFile().getRelativePathAsModuleSpecifierTo(destFile)
          f.addExportDeclaration({
            ...i.getStructure(),
            moduleSpecifier, 
            namedExports: [{name: node.getName()}]
          })

        })
    })
}





let tmpSourceFile: SourceFile

export function safeOrganizeImports(f: SourceFile, project: Project) {
  if (!tmpSourceFile) {
    tmpSourceFile = project.createSourceFile(`tmp_${new Date().getTime()}.ts`, '')
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

        .filter(r => r.isDefinition() && (outside ? !r.getNode().getFirstAncestor(a => a === node) : !!r.getNode().getFirstAncestor(a => a === node)))
        .map(r => r.getNode())
    })
  return flat(refs).filter((n, i, a) => a.indexOf(n) === i)
}

