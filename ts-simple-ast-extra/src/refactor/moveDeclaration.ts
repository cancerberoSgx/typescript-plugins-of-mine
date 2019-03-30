import {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  SourceFile,
  TypeGuards
} from 'ts-morph'
import { getNodeLocalNamesNotReferencing } from '..'

interface Options {
  declaration: Declaration // TODO: more general
  target: SourceFile
}
type Declaration = ClassDeclaration | InterfaceDeclaration

export function moveDeclaration(options: Options) {
  const { declaration: node, target } = options
  // if (!node.getNameNode() || !node.getName()) {
  if (!TypeGuards.hasName(node)) {
    throw 'Declaration must have name'
  }
  if (!TypeGuards.isSourceFile(node.getParent())) {
    throw 'Declaration parent must be SourceFile'
  }

  if (node.isDefaultExport()) {
    throw 'Moving default exported nodes is not supported'
  }

  const nodeName = getNodeNameForFile(node, target)
  if (nodeName !== node.getName()) {
    node.rename(nodeName)
  }

  const nodeOriginalFile = node.getSourceFile()
  nodeOriginalFile.addImportDeclaration({
    // will later be removed with organizeImports if unused
    namedImports: [nodeName],
    moduleSpecifier: nodeOriginalFile.getRelativePathAsModuleSpecifierTo(target)
  })

  // const refs = node.ref.findReferences().map(r=>r.getDefinition().getName())

  removeImportsToNode(target, node)

  addDeclaration(node, target)
  node.remove()

  // organize imports on all files, as final step since it will forgot nodes
  nodeOriginalFile.organizeImports()
  target.organizeImports()
}

function removeImportsToNode(target: SourceFile, node: InterfaceDeclaration) {
  target
    .getImportDeclarations()
    .filter(i => i.getModuleSpecifierSourceFile() === node.getSourceFile())
    .forEach(i => {
      i.getNamedImports()
        .filter(i => i.getName() === node.getName())
        .forEach(n => {
          n.remove()
        })
      if (i.getNamedImports().length === 0) {
        i.remove()
      }
    })
}

function addDeclaration(node: Declaration, target: SourceFile, index = 0) {
  node.setIsExported(true)
  const nodeStructure = node.getStructure()
  if (TypeGuards.isClassDeclaration(node)) {
    target.insertClass(index, nodeStructure as ClassDeclarationStructure)
  } else if (TypeGuards.isInterfaceDeclaration(node)) {
    target.insertInterface(index, nodeStructure as InterfaceDeclarationStructure)
  }
}

/**
 * Gets a safe name for node to be moved as root node of given file.
 */
function getNodeNameForFile(node: Declaration, ...files: SourceFile[]) {
  const targetLocalNames = files.map(f => getNodeLocalNamesNotReferencing(f, node)).flat()
  let nodeName = node.getName()!
  let i = 1
  while (targetLocalNames.includes(nodeName)) {
    i++
    nodeName = `${node.getName()!}${i}`
  }
  return nodeName
}
