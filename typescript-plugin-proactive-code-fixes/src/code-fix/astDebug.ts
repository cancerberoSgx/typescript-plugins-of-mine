import { now, timeFrom } from 'hrtime-now';
import { Node } from 'ts-simple-ast';
import * as sts from 'ts-simple-ast'
import * as ts from 'typescript';
import { CodeFix, CodeFixOptions } from '../codeFixes';
import { matchGlobalRegexWithGroupIndex } from './regex-groups-index';
import { dumpAst } from 'typescript-ast-util';
import { readFileSync } from 'fs';

// TODO: move this to ast-inspector !

// TODO: eval code safely using node vm so security people dont complain

// TODO: expose info, project etc in context

// TODO: would be interesting to have the possibility of autocomplete from the editor or to describe a symbol type. example:
// printAst(node.getSourceFile()
// const printType(node.getDescendantOfKind(ts.SyntaxFoo,ClassDeclaration)) 
// prints pretty structure of node and also a link to definition file. Will be weird because some def files will be in the host project...
// notice that ts is available for him

// TODO: let the user write js without comment wrapping and select the text wants to execute...


/** context of evaluated code available in `c` variable */
interface IEvalContext {
  /** this is the whole typescript namespace as imported with `"import * as ts from 'typescript'` */
  ts: typeof ts
  /** this is the whole ts-simple-ast namespace as imported with `import * as sts from 'ts-simple-ast'` */
  tsa: typeof sts
  /** The user selected or where his cursor is when he activated this refactor. It will be never undefined - at least it will be the SourceFile. The type is ts-simple-ast Node - you can obtain the ts.Node using target.compilerNode */
  node: Node
  /** use it like console log to put debug strings that then will be printed back in the document */
  print(s): void
  /** will dump a pretty recursive structure of given node's descendants */
  printAst(node:Node|ts.Node): string
  /** log messages back to tsserver (so host plugin and tsserver can see them) */
  log: (msg:string)=>void
}





class EvalContext implements IEvalContext {
  ts = ts
  tsa = sts
  _printed = []
  constructor(public node: Node, public log: (msg: string)=>void) {
  }
  print(s): void { 
    this._printed.push(s) 
  }
  printAst(node:Node|ts.Node): string{
    return dumpAst((node as any).compilerNode || node)
  }
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
    eval(codeToEval)
  } catch (ex) {
    __context__.log('astdebug, eval error (outer): ' + ex + ' - ' + JSON.stringify(ex))
    __result__.errorOuter = ex
  }
  __result__.output = __context__._printed
  return __result__
}
function prettyPrintEvalResult(evalResult) {
  const output = `\nOutput:\n${evalResult.output.join('\n>  ')}\n`
  const error = evalResult.error ? `\nError: \n` + evalResult.error + '\nstack:\n ' + evalResult.error.stack + ' \nerror object: \n' + JSON.stringify(evalResult.error) : ''; // TODO: errorOuter
  return '\n/*######################' + (error||'')  + output + '\n##########################*/'
}

export const astDebug: CodeFix = {

  name: 'eval-code-debug',

  needSimpleAst: true,
  
  config: {}, 

  predicate: (arg: CodeFixOptions): boolean => {
    return true//arg.containingTarget.getSourceFile().getText()===readFileSync(arg.containingTarget.getSourceFile().fileName).toString()
  },

  description: (arg: CodeFixOptions): string => `*EVAL* code`,

  apply: (arg: CodeFixOptions) => {
    const t0 = now()
    const sourceFile = arg.simpleNode.getSourceFile()

    const saved = arg.containingTarget.getSourceFile().getFullText().trim()===readFileSync(arg.containingTarget.getSourceFile().fileName).toString().trim()
    if(!saved){ // prettier this code and put it in as ast-utils helper 
      sourceFile.insertText(arg.simpleNode.getEnd(), `/* Please save the file before evaluating code, thanks */`)
      arg.log(`astdebug not applying because file is not saved - comparing  arg.containingTarget.getSourceFile().getText().trim()===${ arg.containingTarget.getSourceFile().getFullText().trim()}  with readFileSync(arg.containingTarget.getSourceFile().fileName).toString()===${readFileSync(arg.containingTarget.getSourceFile().fileName).toString()}`)
      return ;
    }
    // sourceFile.saveSync();
    // sourceFile.refreshFromFileSystemSync()
    // sourceFile.emit()
    const regex =  /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
    const result = matchGlobalRegexWithGroupIndex(regex, arg.containingTarget.getSourceFile().getFullText())

    arg.log('astdebug apply matchGlobalRegexWithGroupIndex result ' + JSON.stringify(result, null, 2))
    const context = new EvalContext(arg.simpleNode||sourceFile, arg.log)
    const toPrint = result && result.length && result.map(match => {

      arg.log('astdebug apply doEval() result \n' + match[0] + ' and context == ' + context)
      const evalResult = doEval(match[0].value, context) // TODO: log client eval() time and print it back

      arg.log('astdebug apply doEval ' + JSON.stringify(evalResult, null, 2) + evalResult.error ? ('\nERROR is: ' + JSON.stringify(evalResult.error, null, 2)) : '')

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

// You have a "c" variable with a context object with useful utilities, among others: (TODO: link to IEvalContext apidocs)

// ts: typeof ts                             whole typescript namespace available
// sts: typeof tsa                           whole ts-simple-ast namespace available
// node: Node                                node selected by user when activated this refactor
// print(s): void                            print text back here a analog to console.log 
// printAst (node:Node|ts.Node): string      pretty prints AST structure of given node to understand it 

// This is the code will be executed here : 

c.print(\`
Hello from editor. Using typescript version: \${c.ts.version}

Selected node by user is a \${c.node.getKindName()} and its parent's text is "\${c.node.getParent().getText()}"

The AST structure of this file:  
\${c.printAst(c.node.getSourceFile())}
\`)

@***/
      `)
      // sourceFile.saveSync()
      // sourceFile.emit()
      arg.log('astdebug apply !Print saveSync and emit ended')
    }
    else {

      arg.log('astdebug apply Print comments starts')
      toPrint.forEach(content => {
        sourceFile.insertText(content.printPosition, content.text)
        // sourceFile.saveSync()
        // sourceFile.emit()

        arg.log(`astdebug apply Print ${content.printPosition}, ${content.text} `)

      })
      arg.log('apply took ' + timeFrom(t0))
    }
  }

}

