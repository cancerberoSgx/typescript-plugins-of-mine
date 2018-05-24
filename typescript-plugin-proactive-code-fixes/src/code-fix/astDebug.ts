import { now, timeFrom } from 'hrtime-now';
import { Node } from 'ts-simple-ast';
import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { matchGlobalRegexWithGroupIndex } from './regex-groups-index';

// TODO: eval code safely using node vm so security people dont complain

// TODO: would be interesting to have the possibility of autocomplete from the editor or to describe a ymbol type. example:
// printAst(node.getSourceFile()
// const printType(node.getDescendantOfKind(ts.SyntaxFoo,ClassDeclaration)) 
// prints pretty structure of node and also a link to definition file. Will be weird because some def files will be in the host project...
// notice that ts is available for him

// TODO: let the user write js without comment wrapping and select the text wants to execute...
// 

interface IEvalContext {
  ts: typeof ts
  target: Node
  arg: CodeFixOptions
  print(s): void
}
class EvalContext {
  ts: typeof ts;
  node: Node
  arg: CodeFixOptions
  _printed = []
  constructor(arg: CodeFixOptions) {
    this.arg = arg
    this.node = this.arg.simpleNode
    this.ts = ts
  }
  print(s): void { this._printed.push(s) }
}
export interface EvalResult {
  output?: string[]
  error?: Error
  errorOuter?: Error
}

function createEvalFn(context, code) {
  return
}
function doEval(code, __context__: EvalContext): EvalResult {
  // heads up - we are type/catch inside eval. If we let eval code throw exceptions this will impact not only this extension but all other plugins in the tsserver instance 
  const __result__: EvalResult = {};
  const codeToEval = `
(function(c){
try {
  ${code}
}catch(ex){
  __result__.error = ex;
}
})(__context__);
  `
  try {
    __context__.arg.log('astdebug about to eval ' + code)
    eval(codeToEval)
  } catch (ex) {
    __context__.arg.log('astdebug, eval error (outer): ' + ex + ' - ' + JSON.stringify(ex))
    __result__.errorOuter = ex
  }
  __result__.output = __context__._printed
  return __result__
}
function prettyPrintEvalResult(evalResult) {
  const output = `\nOutput:\n${evalResult.output.join('\n>  ')}\n`
  const error = evalResult.error ? `\nError: \n` + evalResult.error + '\nstack:\n ' + evalResult.error.stack + ' \nerror object: \n' + JSON.stringify(evalResult.error) : '\nNo errors'; // TODO: errorOuter
  return '\n######################' + error  + output + '\n##########################'
}



// let toPrint: { text: string, printPosition: number }[]

const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
const regexNotGlobal = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/im // same as regex but not global - so predicate wont consume regex


export const astDebug: CodeFix = {
  name: 'astdebug',
  config: { inNewFile: false }, // TODO  - one could be the output wrapping type: line comment, block comment. template string - oher could be the format of /***@ */
  predicate: (arg: CodeFixOptions): boolean => {
    const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
    return !!arg.containingTarget.getSourceFile().getText().match(regexNotGlobal)

  },
  description: (arg: CodeFixOptions): string => {
    return `debug: eval code` // TODO could be selected in the future 
  },
  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    const sourceFile = arg.simpleNode.getSourceFile()

    const result = matchGlobalRegexWithGroupIndex(regex, arg.containingTarget.getSourceFile().getText())

    arg.log('astdebug apply matchGlobalRegexWithGroupIndex result ' + JSON.stringify(result, null, 2))
    const context = new EvalContext(arg)
    const toPrint = result && result.length && result.map(match => {

      arg.log('astdebug apply doEval() result \n' + match[0] + ' and context == ' + context)
      const evalResult = doEval(match[0].value, context) // TODO: log client eval() time and print it back

      arg.log('astdebug apply doEval ' + JSON.stringify(evalResult, null, 2) + evalResult.error ? ('\nERRRRRRRRR: ' + JSON.stringify(evalResult.error, null, 2)) : '')

      const text = prettyPrintEvalResult(evalResult)
      return { text, printPosition: match[1].end }
    })

    arg.log('astdebug apply return true and toPrint == ' + toPrint ? JSON.stringify(toPrint, null, 2) : 'undefined')


    if (!toPrint) {
      arg.log('astdebug apply !Print, node info: kind: ' + arg.simpleNode.getKindName())
      sourceFile.insertText(arg.simpleNode.getSourceFile().getEnd(), `
/***@ 

// For evaluating code you can use a comment with a format like this one, (see how starts with "/*** followed by "at")
// You could have many of these comments as this one as long they contain VALID JAVASCRIPT 
// (this is why we use line comments inside for this internal comments)
// You will have a "c" context object with properties (TODO link to API docs): 

//   ts: typeof ts
//   node: Node
//   arg: CodeFixOptions
//   print(s):void

// Everything you print with c.print() will be printed back here (similar to console.log())

c.print('\`Hello from editor: $\{c.ts}  $\{c.node} \`')

// print('selected node kind is ' + c.node.getKindName())

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

