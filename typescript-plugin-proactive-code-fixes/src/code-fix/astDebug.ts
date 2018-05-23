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

interface IEvalContext {
  ts: typeof ts
  target: Node
  arg: CodeFixOptions
  print(s): void
}
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
  print(s): void { this._printed.push(s) }
}
export interface EvalResult {
  returnValue: any
  output: string[]
  error: Error
}

function createEvalFn(context, code) {
  return
}
function doEval(code, context: EvalContext): EvalResult {
  let returnValue, error

  //TODO: IMPORTANT : the try catch needs to be in the server. If is catched here th server dies because throws! or so it seems! importan!!!!!!!!!!!!!!!!!!!!!!!!!
  let fn = function (c) {
    try {
      context.arg.log('astdebug about to eval ' + code)
      returnValue = eval(code)
    } catch (ex) {
      context.arg.log('astdebug, doEval error: ' + ex + ' - ' + JSON.stringify(ex))
      error = ex
    }
  }

  fn = fn.bind(context)

  fn(context)


  return { returnValue, output: context._printed, error }
}
function prettyPrintEvalResult(evalResult) {
  const result = `RESULT: (${typeof evalResult.result}) ${evalResult.result+''}\n`
  const output = `Output:\n${evalResult.output.join('\n>  ')}\n`
  const error = evalResult.error ? `Error: \n` + evalResult.error +'\nstack:\n ' +evalResult.error.stack+' \nerror object: \n'+ JSON.stringify(evalResult.error) : 'No errors'; 
  return '\n######################'+error + result + output + '\n##########################'
}



let toPrint: { text: string, printPosition: number }[]

export const astDebug: CodeFix = {
  name: 'astdebug',
  config: { inNewFile: false }, // TODO  - one could be the output wrapping type: line comment, block comment. template string - oher could be the format of /***@ */
  // TODO: let the user write js wihtout comment wrapping and select the text wants to execute...
  predicate: (arg: CodeFixOptions): boolean => { // heads up ! this predicate is not light weight - it's doing the eval! TODO (important) move it to apply!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    arg.log('astdebug predicate starts')
    const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
    const result = matchGlobalRegexWithGroupIndex(regex, arg.containingTarget.getSourceFile().getText())

    arg.log('astdebug predicate matchGlobalRegexWithGroupIndex result ' + JSON.stringify(result, null, 2))
    const context = new EvalContext(arg)
    toPrint = result && result.length ? result.map(match => {

      arg.log('astdebug predicate doEval(match[0], context) result \n' + match[0] + ' and !!context == ' + !!context)
      const evalResult = doEval(match[0].value, context) // TODO: log time and print it back

      arg.log('astdebug predicate doEval ' + JSON.stringify(evalResult, null, 2) + '\nERRRRRRRRR: ' + JSON.stringify(evalResult.error, null, 2))

      const text = prettyPrintEvalResult(evalResult)
      return { text, printPosition: match[1].end }
    }) : undefined

    arg.log('astdebug predicate return true and toPrint == ' + JSON.stringify(toPrint, null, 2))
    return true
  },
  description: (arg: CodeFixOptions): string => {
    return `debug: eval code` // TODO could be selected in the future 
  },
  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    const sourceFile = arg.simpleNode.getSourceFile()
    if (!toPrint) {
      arg.log('astdebug apply !Print, node info: kind: ' + arg.simpleNode.getKindName())
      sourceFile.insertText(arg.simpleNode.getSourceFile().getEnd(), `
/***@ 
// For evaluating code you can use a comment like this one that starts with
// Your code will be evaluated in the editor's server and printed back here
// you could have many of these comments and you dont need to select any text
// comment content need to be valid JavaScript. (in the future we'll be supporting selecting code to exec)
// Try to execute this comment activating this refactor again. This is your context interface: 

// interface IEvalContext{
//   ts: typeof ts
//   target: Node
//   arg: CodeFixOptions
//   print(s):void
// }

//print('selected node kind is ' + target.getKindName())
c.print('something simple from editor') // all string printed will be printed back in the editor
'good bye' // this last expression will be the return value

@***/
      `)
      sourceFile.saveSync()
      sourceFile.emit()
      arg.log('astdebug apply !Print saveSync and emit ended')
    }
    else {

      arg.log('astdebug apply Print comments starts')
      toPrint.forEach(content => {
        sourceFile.insertText(content.printPosition, content.text)
        sourceFile.saveSync()
        sourceFile.emit()

        arg.log(`astdebug apply Print ${content.printPosition}, ${content.text} `)

      })
      arg.log('apply took ' + timeFrom(t0))
    }
  }

}

