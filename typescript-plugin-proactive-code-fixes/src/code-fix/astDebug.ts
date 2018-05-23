import { now, timeFrom } from 'hrtime-now';
import { HeritageClause, TypeGuards, Node } from 'ts-simple-ast';
import * as ts from 'typescript';
import { getKindName } from 'typescript-ast-util';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { matchGlobalRegexWithGroupIndex } from './regex-groups-index';

// IMPORTATNT: user can only write js not ts
//TODO: would be interesting to have the possibility of autocomplete from the editor or to describe a ymbol type. example:
// printAst(node.getSourceFile()
// const printType(node.getDescendantOfKind(ts.SyntaxFoo,ClassDeclaration)) 
// prints pretty structure of node and also a link to definition file. Will be weird because some def files will be in the host project...
// notice that ts is available for him

// TODO. perhaps would be usefl for the user to just write js (without commants) (prettyprint / format) and select some text and execute it . Typechecking could be accomplish by importing ts on his side...


class EvalContext {
  ts: typeof ts;
  target: Node
  arg: CodeFixOptions
  _printed = []
  constructor(arg: CodeFixOptions) {
    this.arg = arg
    this.target = this.arg.simpleNode
    this.ts = ts
  }
  print(s) { this._printed.push(s) }
}
export interface EvalResult{
  returnValue: any
  output: string[]
}
function doEval(string, context: EvalContext): EvalResult {
  
  const returnValue = (function(c){return eval(string)}.bind(context))(context)
  return { returnValue, output: context._printed }
}
function prettyPrintEvalResult(evalResult){
  return `RESULT: "${evalResult.result}\nOuput:\n${evalResult.output.join('\n>  ')}\n"`
}

let toPrint: {text:string, printPosition: number}[]
export const astDebug: CodeFix = {
  name: 'astdebug',
  config: { inNewFile: false }, // TODO  - one could be the output wrapping type: line comment, block comment. template string - oher could be the format of /***@ */
  // TODO: let the user write js wihtout comment wrapping and select the text wants to execute...
  predicate: (arg: CodeFixOptions): boolean => {
    const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
    const result = matchGlobalRegexWithGroupIndex(regex, arg.containingTarget.getSourceFile().getText())
    if (!result) {
      return
    }
    const modifications = []
    const context = new EvalContext(arg)
    toPrint = result.map(match => {
      const evalResult = doEval(match[1], context) // TODO: log time and print it back
      const text = prettyPrintEvalResult(evalResult)
      return { text, printPosition: match[2].end }
    })
    if (!arg.diagnostics.find(d => d.code === 2304)) {
      arg.log('astDebug predicate false because diagnostic code dont match:  ' + arg.diagnostics.map(d => d.code).join(', '))
      return false
    }
  },
  description: (arg: CodeFixOptions): string => {
    return `debug: eval code` // todo could be selected in the future 
  },
  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    if(!toPrint||typeof toPrint !== )
    const sourceFile = arg.simpleNode.getSourceFile()

    toPrint.forEach(content=>{
      sourceFile.insertText(content.printPosition, content.text)
      sourceFile.saveSync()
      sourceFile.emit()
    })
    arg.log('apply took ' + timeFrom(t0))
  }

}







// !function(){
//   const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
//   const exampleThatMatch = `
//   /***@
//   debug.print('hello editor, simpleNode kind is ' +
//   arg.simpleNode.getKindName())
//   @***/

//   const a = 1 //user

//   /***@
//   debug.print(arg.simpleNode.getParent().getKindName())
//   @***/
//   `
//   const text = exampleThatMatch // arg.containingTarget.getSourceFile().getText()
//   function exec(r, s) {
//     function indexOfGroup(match, n) {
//       var ix = match.index;
//       for (var i = 1; i < n; i++)
//         ix += match[i].length;
//       return ix;
//     }
//     let result
//     let lastMatchLength = 0
//     const matches = []
//     while ((result = regex.exec(text))) {
//       const match = []
//       for (let i = 1; i < result.length; i++) {
//         const relIndex = indexOfGroup(result, 1) + lastMatchLength
//         match.push({ value: result[i], start: relIndex, end: relIndex + result[i].length })
//       }
//       matches.push(match)
//       lastMatchLength += result[0].length  
//     }
//     return matches
//   }

//   const groupsWithIndex = exec(regex, text)


//   console.log({groupsWithIndex})

//   // now test - let's remove everything else but matched groups 
//   let frag = ''
//   groupsWithIndex.forEach(match=>match.forEach(group=>{
//     console.log(group.start, group.end);

//     frag += text.substring(group.start, group.end) + '\n#######\n'
//   }))
//   console.log('Only matched groups', frag)
// }()

