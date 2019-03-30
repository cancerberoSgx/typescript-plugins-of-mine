import {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  SourceFile,
  TypeGuards,
  ImportDeclaration,
  SyntaxKind,
  Node
} from 'ts-morph'
import { getNodeLocalNamesNotReferencing } from '..'
import { notFalsy } from 'misc-utils-of-mine-typescript'

interface Options {
  declaration: Declaration // TODO: more general
  target: SourceFile
}
type Declaration = ClassDeclaration | InterfaceDeclaration

/**
 * TODO: do all in other files so we can rollback if it fails at last moment
 */
export function moveDeclaration(options: Options) {
  const { declaration: node, target } = options
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

  addImportsToTarget(node, target)

  if (nodeName !== node.getName()) {
    node.rename(nodeName)
  }
  updateOtherFilesImports(node, target, nodeName)

  const nodeOriginalFile = node.getSourceFile()
  nodeOriginalFile.insertImportDeclaration(0, {
    namedImports: [nodeName],
    moduleSpecifier: nodeOriginalFile.getRelativePathAsModuleSpecifierTo(target)
  })
  removeImportsToNode(target, node)

  addDeclaration(node, target)
  node.remove()

  nodeOriginalFile.organizeImports()
  target.organizeImports()
}

function updateOtherFilesImports(node: InterfaceDeclaration, target: SourceFile, nodeName: string) {
  node
    .findReferences()
    .map(r => r.getDefinition())
    .filter(r => r.getSourceFile() !== target && r.getSourceFile() !== node.getSourceFile())
    .map(d => d.getDeclarationNode())
    .filter(notFalsy)
    .filter(TypeGuards.isImportSpecifier)
    .forEach(d => {
      ensureImport(d.getSourceFile(), target, nodeName)
      if (
        d.getParent()!.getElements().length <= 1 &&
        !d
          .getParent()
          .getParent()
          .getParent()
          .getDefaultImport() &&
        !d
          .getParent()
          .getParent()
          .getParent()
          .getNamespaceImport()
      ) {
        d.getParent()
          .getParent()
          .getParent()
          .remove()
      } else {
        d.remove()
      }
    })
}

/**
 * make sure the import declarations of all types referenced in node definition are imported in target source
 * file. It create import declarations and also make sure imported declarations are exported if not
 */
function addImportsToTarget(node: Declaration, target: SourceFile) {
  ;[...node.getDescendants(), node]
    .filter(TypeGuards.isTypeReferenceNode)
    .filter(
      (
        t,
        i,
        a // dedup
      ) =>
        a.findIndex(
          n => n.getSourceFile() === t.getSourceFile() && n.getTypeName().getText() === t.getTypeName().getText()
        ) === i
    )
    .forEach(t => {
      const typeName = t.getTypeName().getText()
      ensureImport(target, t.getSourceFile(), typeName)
      const name = t.getFirstChildByKind(SyntaxKind.Identifier)
      if (name) {
        const defs = name.findReferences().map(r => r.getDefinition())
        if (defs.length === 1) {
          const exportable = defs[0].getDeclarationNode()
          if (exportable) {
            if (TypeGuards.isExportableNode(exportable)) {
              exportable.setIsExported(true)
            } else {
              throw 'type definition is not exportable ' + t.getText() + ' ' + exportable.getText()
            }
          } else {
            throw 'cannot get declaration node ' + t.getText()
          }
        } else {
          throw 'unexpected number of definitions ' + t.getText()
        }
      } else {
        throw 'type with not name ' + t.getText()
      }
    })
}

function ensureImport(target: SourceFile, dest: SourceFile, typeName: string) {
  let i: ImportDeclaration | undefined = target.getImportDeclaration(i => i.getModuleSpecifierSourceFile() === dest)
  if (i) {
    if (!i.getNamedImports().find(n => n.getName() === typeName)) {
      i.addNamedImport(typeName)
    }
  } else {
    target.insertImportDeclaration(0, {
      moduleSpecifier: target.getRelativePathAsModuleSpecifierTo(dest),
      namedImports: [typeName]
    })
  }
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

function addDeclaration(node: Declaration, target: SourceFile) {
  let index = 0
  const ids = target.getImportDeclarations()
  if (ids.length) {
    index = ids[ids.length - 1].getChildIndex() + 1
  }
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
