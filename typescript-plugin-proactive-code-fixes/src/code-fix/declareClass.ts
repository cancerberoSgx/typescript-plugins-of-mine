import { ClassDeclaration, createWrappedNode, Identifier, TypeGuards, HeritageClause } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, PredicateArg } from '../codeFixes';
import { now, timeFrom } from 'hrtime-now';
import { writeFileSync } from 'fs';

let classDecl: ts.ClassDeclaration | undefined
function getClassDeclaration(arg: PredicateArg): ts.ClassDeclaration | undefined {
  if (arg.containingTarget.kind === ts.SyntaxKind.Identifier && arg.containingTarget.parent && arg.containingTarget.parent.parent && arg.containingTarget.parent.parent.kind === ts.SyntaxKind.HeritageClause) {
    return arg.containingTarget.parent.parent.parent as ts.ClassDeclaration // TODO dont cast here - it could be class or interface
  }
  if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.ExpressionWithTypeArguments && arg.containedTarget.parent && arg.containedTarget.parent.kind === ts.SyntaxKind.HeritageClause) {
    return arg.containedTarget.parent.parent as ts.ClassDeclaration // TODO dont cast here - it could be class or interface
  }
}
function getMissingDeclId(arg: PredicateArg): ts.Identifier {
  if (arg.containingTarget.kind === ts.SyntaxKind.Identifier) {
    return arg.containingTarget as ts.Identifier
  }
  if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.ExpressionWithTypeArguments) {
    // then we msut find which child Identifier is the one referenced in the diagnostics

    return arg.containedTarget.getChildren().find(c => {
      return !!arg.diagnostics.find(d => d.code === 2304 && d.start == c.getStart()/* && d.length===c.getText().length*/)
    }) as ts.Identifier
  }
}

export const declareClass: CodeFix = {

  name: 'Declare Class',

  config: { inNewFile: false }, // TODO 

  // needSimpleAst: false,

  predicate: (arg: PredicateArg): boolean => {
    if (!arg.diagnostics.find(d => d.code === 2304)) {
      arg.log('declareClass predicate false because diagnostic code dont match:  ' + arg.diagnostics.map(d => d.code).join(', '))
      return false
    }
    classDecl = getClassDeclaration(arg)
    if (classDecl) {
      return true
    }
    else {
      arg.log('declareClass predicate false because arg.containingTarget.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },

  description: (arg: PredicateArg): string => {// TODO: guess if it si a class or interface
    return `Declare class or interface "${classDecl.name && classDecl.name.getText() || 'unknown'}"`
  },

  apply: (arg: PredicateArg) => {
    const t0 = now()
    const sourceFile = arg.containingTarget.getSourceFile()

    const id = getMissingDeclId(arg)
    const simpleId = createWrappedNode(id as any, { typeChecker: arg.program.getTypeChecker() as any }) as Identifier;
    const simpleClassDec = simpleId.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
    let h: HeritageClause

    if (!TypeGuards.isHeritageClause(h = simpleId.getFirstAncestorByKind(ts.SyntaxKind.HeritageClause))) {
      return
    }

    const code =
      `
/** debug : ${id.getText()}  ${h.getText()}*/

${simpleClassDec.isExported() ? 'export' : ''} ${h.getToken() === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'} ${id.getText()} {

}

`
    // TODO: do it with structures or ast or printer / emitter not w strings
    const s = sourceFile.getText()
    const finalCode = s.substr(0, simpleClassDec.getStart()) + code + s.substr(simpleClassDec.getStart(), s.length)

    sourceFile.update(finalCode, {span: {start: 0, length: s.length }, newLength: finalCode.length})
    writeFileSync(sourceFile.fileName, finalCode)
    arg.log('apply took ' + timeFrom(t0))
  }

}
