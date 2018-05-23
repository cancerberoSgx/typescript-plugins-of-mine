import { now, timeFrom } from 'hrtime-now';
import { HeritageClause, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';


export const astDebug: CodeFix = {

  name: 'astdebug',

  config: { inNewFile: false }, // TODO 

  predicate: (arg: CodeFixOptions): boolean => {


    !function(){
    const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
    const exampleThatMatch = `
    /***@
    debug.print('hello editor, simpleNode kind is ' +
    arg.simpleNode.getKindName())
    @***/
    
    const a = 1 //user
    
    /***@
    debug.print(arg.simpleNode.getParent().getKindName())
    @***/
    `
    const text = exampleThatMatch // arg.containingTarget.getSourceFile().getText()
    function exec(r, s) {
      function indexOfGroup(match, n) {
        var ix = match.index;
        for (var i = 1; i < n; i++)
          ix += match[i].length;
        return ix;
      }
      let result
      let lastMatchLength = 0
      const matches = []
      while ((result = regex.exec(text))) {
        const match = []
        for (let i = 1; i < result.length; i++) {
          const relIndex = indexOfGroup(result, 1) + lastMatchLength
          match.push({ value: result[i], start: relIndex, end: relIndex + result[i].length })
        }
        matches.push(match)
        lastMatchLength += result[0].length  
      }
      return matches
    }

    const groupsWithIndex = exec(regex, text)

  
    console.log({groupsWithIndex})

    // now test - let's remove everything else but matched groups 
    let frag = ''
    groupsWithIndex.forEach(match=>match.forEach(group=>{
      frag += text.substring(group.start, group.end) + '\n#######\n'
    }))
    console.log('Only matched groups', frag)
  }()



    if (arg.containingTarget.getSourceFile().getText().indexOf()
    if (!arg.diagnostics.find(d => d.code === 2304)) {
        arg.log('astDebug predicate false because diagnostic code dont match:  ' + arg.diagnostics.map(d => d.code).join(', '))
        return false
      }
    classDecl = getClassDeclaration(arg)
    if (classDecl) {
      return true
    }
    else {
      arg.log('astDebug predicate false because arg.containingTarget.kind dont match ' + getKindName(arg.containingTarget.kind))
      return false
    }
  },
  description: (arg: CodeFixOptions): string => {// TODO: guess if it si a class or interface
    return `Declare class or interface "${classDecl.name && classDecl.name.getText() || 'unknown'}"`
  },
  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    const sourceFile = arg.containingTarget.getSourceFile()
    const id = arg.simpleNode
    const simpleClassDec = id.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration)
    let h: HeritageClause

    if (!TypeGuards.isHeritageClause(h = id.getFirstAncestorByKind(ts.SyntaxKind.HeritageClause))) {
      return
    }

    const code =
      `
${simpleClassDec.isExported() ? 'export ' : ''}${h.getToken() === ts.SyntaxKind.ImplementsKeyword ? 'interface' : 'class'} ${id.getText()} {

}

`
    arg.simpleNode.getSourceFile().insertText(simpleClassDec.getStart(), code)
    arg.log('apply took ' + timeFrom(t0))
  }

}
