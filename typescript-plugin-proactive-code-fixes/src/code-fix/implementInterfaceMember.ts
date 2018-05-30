// Heads up - this plugin and ObjectLiteralImplementInterface have the same description and attack the same problem}
// TODO: joing both in a single code fix / file. 

// attacks the error : "code": "2416","message": "Property 'method1' in type 'SomeImplementation' is not assignable to the same property in base type 'SomeInterface'.\n  Type '(param: number) => number[]' is not assignable to type '(param: string) => number[]'.\n    Types of parameters 'param' and 'param' are incompatible.\n      Type 'string' is not assignable to type 'number'.",


import { TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant, getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { findInterfacesWithPropertyNamed, fixSignature } from '../util';

export const implementInterfaceMember: CodeFix = {
  name: 'implementInterfaceMember',
  config: { recursive: false, addMissingPropertiesToInterface: false }, // recursive tre will generate the whole sub literals.. 
  predicate: (arg: CodeFixOptions): boolean => {

    const targetLine = ts.getLineAndCharacterOfPosition(arg.sourceFile, arg.containingTarget.getStart()).line
    const diagnostics = arg.diagnostics.filter(d => d.code === 2416).filter(diag => {
      const diagLineStart = ts.getLineAndCharacterOfPosition(arg.sourceFile, diag.start).line
      const diagLineEnd = ts.getLineAndCharacterOfPosition(arg.sourceFile, diag.start + diag.length).line
      return diagLineStart <= targetLine && diagLineEnd >= targetLine
    })

    if (!diagnostics || !diagnostics.length) {
      arg.log('codeFixCreateVariable predicate false because no diagnostics found with code 2322 in same line as arg.containingTarget')
      return false
    }

    if (arg.containingTarget.kind === ts.SyntaxKind.Identifier) {
      // in this case user selected a fragment of the id. quick issue fix: 
      if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.SourceFile) {
        arg.containedTarget = undefined
      }
      return true
    }
    else if (arg.containedTarget && arg.containedTarget.kind === ts.SyntaxKind.Identifier) {
      // user selected the exactly the id (double click)
      return true
    }
    else if (arg.containedTarget && (findAscendant(arg.containedTarget, n => n.kind === ts.SyntaxKind.PropertyDeclaration) || findAscendant(arg.containedTarget, n => n.kind === ts.SyntaxKind.VariableDeclaration))) {
      return true
    }
    else {
      arg.log('codeFixCreateVariable predicate false because child.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },

  description: (arg: CodeFixOptions): string => `Implement Interface`,

  apply: (arg: CodeFixOptions): ts.ApplicableRefactorInfo[] | void => {

    // print = c.print
    // clone source file so this one is not modified
    // const sourceFile = arg.simpleProject.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
    // TODO: support constructors and getter/setter
    const sourceFile = arg.simpleNode.getSourceFile()
    const id = arg.simpleNode
    // const id = sourceFile.getDescendantAtPos(487)//(755)//(655)//(764)
    const member = id.getParent()
    const decl = member.getParent()
    if (!(TypeGuards.isIdentifier(id) &&
      (TypeGuards.isMethodDeclaration(member) || TypeGuards.isPropertyDeclaration(member)) &&
      TypeGuards.isClassDeclaration(decl)
    )) {
      return arg.log(`predicate not complied: decl: ${decl.getKindName()} member: ${member.getKindName()} id: ${id.getKindName()}`)
    }
    const interfaceWithMemberName = findInterfacesWithPropertyNamed(decl, id.getText()).pop() // TODO: we choose any member signature - we should choose the most similar one

    const memberSignature = interfaceWithMemberName.getMembers().filter(TypeGuards.isPropertyNamedNode).pop() // TODO: any arbitrary signature

    if (TypeGuards.isMethodSignature(memberSignature) && TypeGuards.isMethodDeclaration(member)) {

      fixSignature(member, memberSignature)

    } else if (TypeGuards.isPropertySignature(memberSignature) && TypeGuards.isPropertyDeclaration(member)) {
      member.setType(memberSignature.getType().getText())
    }
  }

}


