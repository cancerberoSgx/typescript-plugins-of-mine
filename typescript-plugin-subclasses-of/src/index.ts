import { findChild2, findChildContainingPosition, findParent, positionOrRangeToNumber, findIdentifierString, findChild } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';


const PLUGIN_NAME = 'typescript-plugin-subclasses-of'
const ACTION_NAME_DIRECT_SUBCLASSES = `${PLUGIN_NAME}-direct-subclasses-refactor-action`
const ACTION_NAME_INDIRECT_SUBCLASSES = `${PLUGIN_NAME}-indirect-subclasses-refactor-action`
const ACTION_NAME_INHERITANCE = `${PLUGIN_NAME}-inheritance-refactor-action`


let ts: typeof ts_module
let info: ts_module.server.PluginCreateInfo

function init(modules: { typescript: typeof ts_module }) {
  ts = modules.typescript

  function create(anInfo: ts_module.server.PluginCreateInfo) {
    info = anInfo
    info.project.projectService.logger.info(`${PLUGIN_NAME} created`)

    // initialize proxy 
    const proxy: ts.LanguageService = Object.create(null)
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args)
    }

    proxy.getApplicableRefactors = getApplicableRefactors
    proxy.getEditsForRefactor = getEditsForRefactor

    return proxy
  }
  return { create }
}

export = init

let selectedDef: ts.ReferencedSymbol | undefined

function getApplicableRefactors(fileName: string, positionOrRange: number | ts.TextRange)
  : ts_module.ApplicableRefactorInfo[] {
  const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange) || []

  const refs = info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange))
  if (!refs || !refs.length) {
    // info.project.projectService.logger.info(`${PLUGIN_NAME} not suggesting because refs is empty`)
    return refactors
  }
  const selectedDefs: ts.ReferencedSymbol[] = refs.filter(r => !!(r.definition &&
    (r.definition.kind === ts.ScriptElementKind.classElement || r.definition.kind === ts.ScriptElementKind.interfaceElement)))

  if (!selectedDefs || !selectedDefs.length) {
    // info.project.projectService.logger.info(`${PLUGIN_NAME} not suggesting because selectedDefs is empty`)
    return refactors
  }
  selectedDef = selectedDefs[0]
  refactors.push({
    name: `${PLUGIN_NAME}-refactor-info`,
    description: 'Subclasses of',
    actions: [
      { name: ACTION_NAME_DIRECT_SUBCLASSES, description: 'Show Direct subclasses/implementations of ' + selectedDef.definition.name },
      { name: ACTION_NAME_INDIRECT_SUBCLASSES, description: 'Show Indirect subclasses/implementations of ' + selectedDef.definition.name },
      // { name: ACTION_NAME_INHERITANCE, description: 'Show inheritance of' + selectedDef.definition.name }
    ]
  })
  return refactors
}


function getEditsForRefactor(fileName: string, formatOptions: ts.FormatCodeSettings,
  positionOrRange: number | ts_module.TextRange, refactorName: string,
  actionName: string)
  : ts.RefactorEditInfo | undefined {

  const refactors = info.languageService.getEditsForRefactor(fileName, formatOptions, positionOrRange, refactorName, actionName)

  if (!selectedDef || (actionName != ACTION_NAME_DIRECT_SUBCLASSES && actionName != ACTION_NAME_INDIRECT_SUBCLASSES && actionName!== ACTION_NAME_INHERITANCE)) {
    return refactors;
  }
  const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
  if (!sourceFile) {
    return refactors
  }
  let newText
  // try {
    // const targetSourceFile = info.languageService.getProgram().getSourceFile(selectedDef.definition.fileName)
    // if (!targetSourceFile) {
    //   return refactors
    // }
    const isDirect = actionName == ACTION_NAME_DIRECT_SUBCLASSES
    const subclasses: Array<ts.ClassDeclaration | ts.InterfaceDeclaration> = (isDirect ? getDirectDeclarationReferencesExtending(fileName, positionOrRange) : getIndirectDeclarationReferencesExtending(fileName, positionOrRange));

    newText = '\n/*\n' + (isDirect ? 'Direct' : 'Indirect') + ' subclasses/implementations of ' + selectedDef.definition.name + ':\n' + subclasses.map(c => {
      const sf = c.getSourceFile()
      const pos = sf.getLineAndCharacterOfPosition(c.getStart())
      const type = c.kind === ts.SyntaxKind.ClassDeclaration ? 'class' : 'interface'
      return type + ' ' + (c.name && c.name.getText()) + ' in file:/' + sf.fileName + '#' + (pos.line + 1) + ',' + (pos.character + 1)
    }).join('\n') + '\n*/'

  // } catch (error) {
  //   newText = error + ' - ' + error.stack
  // }

  return {
    edits: [{
      fileName,
      textChanges: [{
        span: { start: sourceFile.getEnd(), length: newText.length },
        newText: newText
      }],
    }],
    renameFilename: undefined,
    renameLocation: undefined,
  }
}

function getDirectDeclarationReferencesExtending(fileName: string, positionOrRange: number | ts_module.TextRange): Array<ts.ClassDeclaration | ts.InterfaceDeclaration> {
  const supers: Array<ts.ClassDeclaration | ts.InterfaceDeclaration> = [];
  const classDefinitions = info.languageService.findReferences(fileName, positionOrRangeToNumber(positionOrRange)).forEach(ref => {
    ref.references.forEach(r => {
      const sf = info.languageService.getProgram().getSourceFile(r.fileName);
      if (!sf) {
        return;
      }
      const refNode = findChildContainingPosition(sf, r.textSpan.start);
      if (!refNode) {
        return;
      }
      const heritageClause: ts.HeritageClause | undefined = findParent(refNode, (p => p.kind === ts.SyntaxKind.HeritageClause)) as ts.HeritageClause;
      if (!heritageClause) {
        return;
      }
      if (heritageClause.parent && (heritageClause.parent.kind === ts.SyntaxKind.ClassDeclaration || heritageClause.parent.kind === ts.SyntaxKind.InterfaceDeclaration)) {
        supers.push(heritageClause.parent as ts.ClassDeclaration);
      }
    });
  });
  return supers;
}

function getIndirectDeclarationReferencesExtending(fileName: string, positionOrRange: number | ts_module.TextRange,
  supers: Array<ts.ClassDeclaration | ts.InterfaceDeclaration> = [], processedDeclNames: Array<string> = [])
  : Array<ts.ClassDeclaration | ts.InterfaceDeclaration> {

  const nodes = getDirectDeclarationReferencesExtending(fileName, positionOrRange)
  if (!nodes) {
    return supers
  }
  if (supers.length && !nodes.find(n => !!supers.find(s => s.name != n.name))) {
    return supers
  }
  nodes.forEach(superNode => {
    if (!supers.find(s => s.name === superNode.name)) { // add only if not already
      supers.push(superNode)
    }
    const superId = findChild2(superNode, c => c.kind === ts.SyntaxKind.Identifier)
    if (!superId) {
      return
    }
    const refs = info.languageService.findReferences(superNode.getSourceFile().fileName, superId.getStart())
    if (!refs) {
      return
    }
    refs.forEach(ref => {
      // processedDeclNames is for protecting of infinite recursion - for example happens with EventEmitter
      if (processedDeclNames.includes(ref.definition.name)) {
        return
      }
      processedDeclNames.push(ref.definition.name)
      ref.references && ref.references.forEach(r => {
        const subs = getIndirectDeclarationReferencesExtending(r.fileName, r.textSpan.start, supers, processedDeclNames)
        subs.forEach(sub => {
          if (!supers.find(s => s.name === sub.name)) { // add only if not already
            supers.push(sub)
          }
        })
      })
    })
  })
  return supers;
}


// function getInheritance()
//   : Array<ts.ClassDeclaration | ts.InterfaceDeclaration> {
//     const a: Array<ts.ClassDeclaration | ts.InterfaceDeclaration> = []
//     if(!selectedDef){
//       return a
//     }

//     const sourceFile = info.languageService.getProgram().getSourceFile(fileName)
//     if (!sourceFile) {
//       return a
//     }
//     const sf = info.project.getSourceFile(selectedDef.definition.fileName.toString())
//     const node = findChildContainingPosition(sourceFile, selectedDef.definition.textSpan.start)
//     if (!node) {
//       return a
//     }
//     return a
// }

// function getInheritanceRec(n:ts.ClassDeclaration | ts.InterfaceDeclaration|undefined): Array<ts.ClassDeclaration | ts.InterfaceDeclaration> {
//   let a : Array<ts.ClassDeclaration | ts.InterfaceDeclaration> = []
//   if(!n){
//     return a
//   }
//   a.push(n)
//   const heritage = findChild(n, c=>c.kind===ts.SyntaxKind.HeritageClause) as ts.HeritageClause
//   if(!heritage || ! heritage.types || !heritage.types.length){
//     return a
//   }
//   heritage.types[0].
//   // if(n.parent){
//   a = a.concat(a, getInheritanceRec(heritage.types[0]))
//   // }
//   return a
// }