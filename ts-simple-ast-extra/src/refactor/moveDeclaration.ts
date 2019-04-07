import {
  BindingName,
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  Identifier,
  ImportDeclaration,
  InterfaceDeclaration,
  NamedNode,
  Node,
  QualifiedName,
  SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeGuards,
  VariableDeclaration,
  ImportSpecifier
} from 'ts-morph'
import { getNodeLocalNamesNotReferencing } from '..'
import { notFalsy, notUndefined } from '../misc'

interface Options {
  declaration: Declaration
  target: SourceFile
}

export type Declaration =
  | ClassDeclaration
  | InterfaceDeclaration
  | EnumDeclaration
  | TypeAliasDeclaration
  | FunctionDeclaration // TODO: variables

function isDeclaration(t: Node): t is Declaration & VariableDeclaration {
  return (
    TypeGuards.isClassDeclaration(t) ||
    TypeGuards.isInterfaceDeclaration(t) ||
    TypeGuards.isEnumDeclaration(t) ||
    TypeGuards.isFunctionDeclaration(t) ||
    TypeGuards.isVariableDeclaration(t) ||
    TypeGuards.isTypeAliasDeclaration(t)
  )
}

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

function updateOtherFilesImports(node: Declaration, target: SourceFile, nodeName: Node & NamedNode) {
  // console.log(nodeName.getSourceFile().getBaseName(), node.getSourceFile()!.getBaseName(), target.getBaseName(), nodeName.getText());
  
  const importSpecifiersWithoutDeclarations: ImportSpecifier[] = []
  node
    .findReferences()
    .map(r => r.getDefinition())
    .map(n=>{
      if(!n.getDeclarationNode()&& TypeGuards.isIdentifier(n.getNode())){
        // in this case it cannot find the declaration node, probably because it was already removed ? 
        // so we remove it here!
        const is =  n.getNode().getFirstAncestorByKind(SyntaxKind.ImportSpecifier)
        if(is){
          importSpecifiersWithoutDeclarations.push(is)
        //   if(is.getParent()!.getElements().length===1){
        //     // TODO: support imports like import P, {a} from 'foo' - nex line break them
        //     const id = is.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
        //     if(id){
        //       id.remove()
        //     }
        //   }
        //   else {
        //     is.remove()
        //   }
          return undefined
        // }
      // }
      // console.log('0', n.getSourceFile().getBaseName(),  n.getSourceFile() !== node.getSourceFile(), n.getSourceFile() !== target, !!n.getDeclarationNode(), n.getNode().getFirstAncestorByKind(SyntaxKind.ImportSpecifier));
      // return n
      // return 
        }
        else {
          //TODO: debug / log ? 
          
        }
        return n
      }
        return n
    })

      .filter(notUndefined)

    .filter(r => r.getSourceFile() !== target && r.getSourceFile() !== node.getSourceFile())
    .map(d => d.getDeclarationNode())
    .filter(notFalsy)
   
    .filter(TypeGuards.isImportSpecifier)
    .concat(importSpecifiersWithoutDeclarations)
    .filter((n,i,a)=>a.indexOf(n)===i) // dedup
    .forEach(d => {
      ensureImport(
        d.getSourceFile(),
        target,
        nodeName.getFirstChildByKindOrThrow(SyntaxKind.Identifier) ||
          nodeName.getFirstChildByKindOrThrow(SyntaxKind.QualifiedName)
      )
      if (
        d.getParent()!.getElements().length <= 1 &&
        !d
          .getParent() // TODO: use getAncestorByKind
          .getParent()
          .getParent()
          .getDefaultImport() &&
        !d
          .getParent()// TODO: use getAncestorByKind
          .getParent()
          .getParent()
          .getNamespaceImport()
      ) {
        // console.log('1', d.getSourceFile().getBaseName());
        
        d.getParent()// TODO: use getAncestorByKind
          .getParent()
          .getParent()
          .remove()
      } else {
        // console.log('2', d.getSourceFile().getBaseName());

        d.remove()
      }
    })
}

/**
 * Makes sure the import declarations of all types referenced in node definition are imported in target source
 * file. It create import declarations and also make sure imported declarations are exported if not
 */
function addImportsToTarget(node: Declaration, target: SourceFile) {
  ;[...node.getDescendants(), node]
    .filter(TypeGuards.isReferenceFindableNode)
    // dedup
    .filter(
      (t, i, a) =>
        a.findIndex(n => n === t || (n.getSourceFile() === t.getSourceFile() && n.getText() === t.getText())) === i
    )
    .map(n =>
      n
        .findReferences()
        .map(r => r.getDefinition().getDeclarationNode())
        .filter(notFalsy)
        .filter(n => TypeGuards.isNamedNode(n) || isDeclaration(n))
    )
    .flat()
    // don't  import standard types like Date, Promise, etc
    .filter(
      t =>
        !t
          .getSourceFile()
          .getFilePath()
          .includes('node_modules/typescript/lib/lib.')
    )
    .filter(notUndefined)
    .forEach(t => {
      const typeName = TypeGuards.isNamedNode(t) ? t.getNameNode() : isDeclaration(t) ? t.getNameNode() : undefined
      if (!typeName) {
        throw 'TODO999 ' + t.getText()
      }
      ensureImport(target, t.getSourceFile(), typeName)
      const name = t.getFirstChildByKind(SyntaxKind.Identifier)
      if (name) {
        const defs = name.findReferences().map(r => r.getDefinition())
        if (defs.length >= 1) {
          const dd = defs.filter(d => d.getDeclarationNode() && TypeGuards.isExportableNode(d.getDeclarationNode()!))
          dd.forEach(d => {
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
          dd.length > 1 && console.warn('unexpected number of definitions ' + t.getText())
        } else {
          throw 'no declarations found for node ' + t.getText()
        }
      } else {
        throw 'type with not name ' + t.getText()
      }
    })
}

function ensureImport(target: SourceFile, dest: SourceFile, typeName: Identifier | QualifiedName | BindingName) {
  let i: ImportDeclaration | undefined = target.getImportDeclaration(i => i.getModuleSpecifierSourceFile() === dest)
  const name = getNodeNameForFile(TypeGuards.isNamedNode(typeName) ? typeName.getName() : typeName.getText(), target)
  if (!name) {
    throw 'cannot ensureImport of node without name'
  }
  if (i) {
    if (!i.getNamedImports().find(n => n.getName() === name)) {
      i.addNamedImport(name)
    }
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
  } else if (TypeGuards.isEnumDeclaration(node)) {
    target.insertEnum(index, node.getStructure())
  } else if (TypeGuards.isFunctionDeclaration(node)) {
    target.insertFunction(index, node.getStructure())
  } else if (TypeGuards.isTypeAliasDeclaration(node)) {
    target.insertTypeAlias(index, node.getStructure())
  } else {
    throw 'Node kind not supported ' + target.getKindName()
  }
}

/**
 * Gets a safe name for given node to be moved as root node of given file.
 */
function getNodeNameForFile(node: Declaration | string, ...files: SourceFile[]) {
  const targetLocalNames = files.map(f => getNodeLocalNamesNotReferencing(f, node)).flat()
  let nodeName = typeof node === 'string' ? node : node.getName()!
  if (!nodeName) {
    throw 'node must have name'
  }
  let i = 1
  while (targetLocalNames.includes(nodeName)) {
    i++
    nodeName = `${nodeName!}${i}`
  }
  return nodeName
}
