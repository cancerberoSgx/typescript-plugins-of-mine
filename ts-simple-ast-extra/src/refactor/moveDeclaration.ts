import {
  ClassDeclaration,
  ClassDeclarationStructure,
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  SourceFile,
  TypeGuards,
  ImportDeclaration,
  SyntaxKind,
  Node,
  EnumDeclaration,
  VariableDeclaration,
  FunctionDeclaration,
  EnumDeclarationStructure,
  FunctionDeclarationStructure,
  TypeAliasDeclaration,
  TypeAliasDeclarationStructure,
  NameableNode,
  NamedNode,
  QualifiedName,
  Identifier,
  BindingName
} from 'ts-morph'
import { getNodeLocalNamesNotReferencing } from '..'
import { notFalsy } from 'misc-utils-of-mine-typescript'
import { getNodeLocalNames } from '../locals';

interface Options {
  declaration: Declaration // TODO: more general
  target: SourceFile
}
type Declaration = ClassDeclaration | InterfaceDeclaration | EnumDeclaration  | TypeAliasDeclaration | FunctionDeclaration // TODO: variables

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
  updateOtherFilesImports(node, target, node)

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

function updateOtherFilesImports(node: Declaration, target: SourceFile, nodeName: Node&NamedNode) {
  node
    .findReferences()
    .map(r => r.getDefinition())
    .filter(r => r.getSourceFile() !== target && r.getSourceFile() !== node.getSourceFile())
    .map(d => d.getDeclarationNode())
    .filter(notFalsy)
    .filter(TypeGuards.isImportSpecifier)
    .forEach(d => {
      ensureImport(d.getSourceFile(), target, nodeName.getFirstChildByKindOrThrow(SyntaxKind.Identifier)||nodeName.getFirstChildByKindOrThrow(SyntaxKind.QualifiedName))
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
    .filter(TypeGuards.isReferenceFindableNode)
    .filter(
      (
        t,
        i,
        a // dedup
      ) =>
        a.findIndex(
          n => n===t || n.getSourceFile() === t.getSourceFile() && n.getText() === t.getText()
        ) === i
    )
    .map(n=>n.findReferences().map(r=>r.getDefinition().getDeclarationNode()).filter(notFalsy)
    // .map(n=>{
    //   console.log('NODE '+n.getText(), n.getKindName(), TypeGuards.isNamedNode(n))      
    //   return n})
    . filter(n=>TypeGuards.isNamedNode(n)||TypeGuards.isClassDeclaration(n)||TypeGuards.isInterfaceDeclaration(n)||TypeGuards.isFunctionDeclaration(n)||TypeGuards.isVariableDeclaration(n)||TypeGuards.isEnumDeclaration(n)||TypeGuards.isTypeAliasDeclaration(n)) // TODO: in isDeclaration predicate
    ).flat()
    .forEach(t => {
      // console.log( typeName.getText(),t.getSourceFile().getBaseName() ,target.getBaseName());
      const typeName =TypeGuards.isNamedNode(t) ?  t.getNameNode() : (TypeGuards.isClassDeclaration(t)||TypeGuards.isInterfaceDeclaration(t)||TypeGuards.isFunctionDeclaration(t)||TypeGuards.isVariableDeclaration(t)||TypeGuards.isTypeAliasDeclaration(t)) ? t.getNameNode() : undefined
      if(!typeName){
        throw 'TODO999 '+t.getText()
      }
      // if(TypeGuards.isNamedNode(typeName)||TypeGuards.isIdentifier(typeName)||TypeGuards.isQualifiedName(typeName)){
        ensureImport(target, t.getSourceFile(), typeName)
      // }
      // else {
      //   throw 'type reference type name is not named node ' + typeName.getText() + ' - '+typeName.getKindName()
      // }
      const name = t.getFirstChildByKind(SyntaxKind.Identifier)
      if (name) {
        const defs = name.findReferences().map(r => r.getDefinition())
        if (defs.length >= 1) {
          const dd = defs.filter(d=>d.getDeclarationNode() && TypeGuards.isExportableNode(d.getDeclarationNode()!))
          dd.forEach(d=>{
            const exportable = d.getDeclarationNode()
            if (exportable) {
              if (TypeGuards.isExportableNode(exportable)) {
                exportable.setIsExported(true)
              } else {
                throw 'type definition is not exportable ' + t.getText() + ' ' + exportable.getText()
              }
            } else {
              throw 'cannot get declaration node ' + t.getText()
            }
          })          
          dd.length > 1&&console.warn(           'unexpected number of definitions ' + t.getText())
        } else {
        throw 'no declarations found for node ' + t.getText()
          
        }
      } else {
        throw 'type with not name ' + t.getText()
      }
    })
}

function ensureImport(target: SourceFile, dest: SourceFile, typeName:  Identifier|QualifiedName|BindingName) {
  let i: ImportDeclaration | undefined = target.getImportDeclaration(i => i.getModuleSpecifierSourceFile() === dest)
const name = getNodeNameForFile(TypeGuards.isNamedNode(typeName) ? typeName.getName() : typeName.getText(), target)
if(!name){
  throw 'cannot ensureImport of node without name'
}
  // const targetLocals = getNodeLocalNames(target)
  if (i ){//&& !getNodeLocalNames(target).includes(name)) {
    if (!i.getNamedImports().find(n => n.getName() === name)) {
      i.addNamedImport(name)
    }
    // else {
    //   console.warn(     'TODO123 '+name+' - import: '+i.getText()+' - target: '+target.getBaseName()+' - dest: '+dest.getBaseName())
    // }
  } else {
    target.insertImportDeclaration(0, {
      moduleSpecifier: target.getRelativePathAsModuleSpecifierTo(dest),
      namedImports: [name]
    })
  }
}

function removeImportsToNode(target: SourceFile, node: Declaration) {
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
  if (TypeGuards.isClassDeclaration(node)) {
    target.insertClass(index, node.getStructure())
  } else if (TypeGuards.isInterfaceDeclaration(node)) {
    target.insertInterface(index, node.getStructure())
  }
  else if (TypeGuards.isEnumDeclaration(node)) {
    target.insertEnum(index, node.getStructure())
  }
  else if (TypeGuards.isFunctionDeclaration(node)) {
    target.insertFunction(index, node.getStructure())
  }
  else if (TypeGuards.isTypeAliasDeclaration(node)) {
    target.insertTypeAlias(index, node.getStructure())
  }
  else {
    throw 'Node kind not supported '+target.getKindName()
  }
}

/**
 * Gets a safe name for node to be moved as root node of given file.
 */
function getNodeNameForFile(node: Declaration|string, ...files: SourceFile[]) {
  const targetLocalNames = files.map(f => getNodeLocalNamesNotReferencing(f, node)).flat()
  let nodeName = typeof node ==='string' ? node : node.getName()!
  if(!nodeName){
    throw 'node must have name'
  }
  let i = 1
  while (targetLocalNames.includes(nodeName)) {
    i++
    nodeName = `${nodeName!}${i}`
  }
  return nodeName
}
