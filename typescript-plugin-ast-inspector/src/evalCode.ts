
// TODO: eval code safely using node vm so security people dont complain

// TODO: for eval selection, user could write typescript and we could transpile it to js before eval
// TODO: expose info, project etc in context

// TODO: would be interesting to have the possibility of autocomplete from the editor or to describe a symbol type. example:
// printAst(node.getSourceFile()
// const printType(node.getDescendantOfKind(ts.SyntaxFoo,ClassDeclaration)) 
// prints pretty structure of node and also a link to definition file. Will be weird because some def files will be in the host project...
// notice that ts is available for him

// TODO: let the user write js without comment wrapping and select the text wants to execute...


import { readFileSync } from 'fs';
import { now, timeFrom } from 'hrtime-now';
import * as sts from 'ts-simple-ast';
import { Node } from 'ts-simple-ast';
import * as ts from 'typescript';
import { dumpAst, positionOrRangeToRange, positionOrRangeToNumber, findChildContainingRange } from 'typescript-ast-util';
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { matchGlobalRegexWithGroupIndex } from './regex-groups-index';
import { EvalContextUtil, EvalContextUtilImpl } from './evalCodeContextUtil';

export const EVAL_CODE_IN_COMMENTS_REFACTOR_ACTION_NAME = `plugin-ast-inspector-eval-code-in-comments`
export const EVAL_SELECTION_REFACTOR_ACTION_NAME = `plugin-ast-inspector-eval-selection`

/** context of evaluated code available in `c` variable */
export interface EvalContext {
  /** this is the whole typescript namespace as imported with `"import * as ts from 'typescript'` */
  ts: typeof ts
  /** this is the whole ts-simple-ast namespace as imported with `import * as sts from 'ts-simple-ast'`. We are providing it as an utility because is much more high level than native typescript - you choose if you want ot work with it or not. */
  tsa: typeof sts
  /** The user selected or where his cursor is when he activated this refactor. It will be never undefined - at least it will be the SourceFile. The type is ts-simple-ast Node.  */
  node: Node
  /** use it like console log to put debug strings that then will be printed back in the document */
  print(s): void
  /** log messages back to tsserver (so host plugin and tsserver can see them). Is like a console.log() */
  log: (msg: string) => void
  util: EvalContextUtil 
  /**
   * Entry point for the plugin execution context. from here you have access to the Project, the Program, current sourcefile, language service, plugin configuration and everything else regarding the context on where the host plugin is being executed. Take into account that everything obtained via `info` will be native typescript objects not ts-simple-ast. For example:
   * 
   * ```
   * const sourceFile = c.config.info.project.getSourceFile(c.fileName)
   * const definition = c.info.languageService.getDefinitionAtPosition(toPosition(c.positionOrRange))
   * ```
   */
  info: ts_module.server.PluginCreateInfo
  /** current file name as provided in plugin's `getEditsForRefactor`*/
  fileName: string, formatOptions: ts.FormatCodeSettings
  /** cursor position or range from where the refactor suggestion was activated as provided in plugin's `getEditsForRefactor`*/
  positionOrRange: number | ts.TextRange,
  /** name of the activated refactor as provided in plugin's `getEditsForRefactor` */
  refactorName: string
  /** name of the activated refactor's action as provided in plugin's `getEditsForRefactor` */
  actionName: string
}


interface EvalResult {
  output?: string[]
  error?: Error
  errorOuter?: Error
}



class EvalContextImpl implements EvalContext {
  ts = ts
  tsa = sts
  _printed = []
  info: ts_module.server.PluginCreateInfo
  fileName: string
  formatOptions: ts.FormatCodeSettings
  positionOrRange: number | ts.TextRange
  refactorName: string
  actionName: string
  node: Node
  util: EvalContextUtil = new EvalContextUtilImpl()
  log: (msg: string) => void
  constructor(config: EvalContextConfig) {
    this.info = config.info
    this.fileName = config.fileName
    this.formatOptions = config.formatOptions
    this.positionOrRange = config.positionOrRange
    this.refactorName = config.refactorName
    this.actionName = config.actionName
    this.log = config.log
    this.node = config.node
  }
  print(s): void {
    this._printed.push(s)
  }
}


function doEval(code, __context__: EvalContextImpl): EvalResult {
  // heads up - we are type/catch inside eval. If we let eval code throw exceptions this will impact not only this extension but all other plugins in the tsserver instance 
  const __result__: EvalResult = {};
  const codeToEval = `
  try {
(function(c){
  ${code}
})(__context__);
}catch(ex){
  __result__.error = ex;
}
  `
  try {// TODO: get how much time it took and print it back
    eval(codeToEval)
  } catch (ex) {
    __context__.log('executeEvalCode, eval error (outer): ' + ex + ' - ' + JSON.stringify(ex))
    __result__.errorOuter = ex
  }
  __result__.output = __context__._printed
  return __result__
}


function prettyPrintEvalResult(evalResult) {
  let output = ''
  if (evalResult.output) {
    output += `Output:\n${evalResult.output.join('\n')}\n`
  }
  let error = '';
  if (evalResult.error) {
    error += `Error: \n${evalResult.error}\nStack:\n ${evalResult.error.stack}\n`
  }
  if (evalResult.errorOuter) {
    error += `Error: \n${evalResult.errorOuter}\nStack:\n ${evalResult.errorOuter.stack}\n`
  }
  return `\nvar __output = \`\n${error + output}\n\``//TODO: escape `
}

export interface EvalContextConfig {
  log: (str: string) => void
  node: Node
  info: ts_module.server.PluginCreateInfo
  fileName: string
  positionOrRange: number | ts.TextRange
  formatOptions: ts.FormatCodeSettings
  refactorName: string
  actionName: string
}

export function executeEvalCode(config: EvalContextConfig): void {

  const t0 = now()
  const sourceFile = config.node.getSourceFile()
  const originalSourceFile = config.info.project.getSourceFile(sourceFile.getFilePath() as any)
  const saved = originalSourceFile.getFullText().trim() === readFileSync(originalSourceFile.fileName).toString().trim()
  if (!saved) {
    sourceFile.insertText(config.node.getEnd(), `/* Please save the file before evaluating code, thanks */`)
    return;
  }

  const context = new EvalContextImpl(config)

  // handle eval selected code
  if (config.actionName === EVAL_SELECTION_REFACTOR_ACTION_NAME && typeof (config.positionOrRange as ts.TextRange).pos === 'number') {
    const range = config.positionOrRange as ts.TextRange
    const code = originalSourceFile.getFullText().substring(range.pos, range.end)
    config.log('executeEvalCode evaluating selected code: ' + code)
    const result = doEval(code, context) //TODO: not logging time & error
    const text = prettyPrintEvalResult(result)
    config.log('executeEvalCode after evaluating selected code result is: ' + JSON.stringify(result, null, 2))
    
    sourceFile.insertText(range.end, text)
    return
  }

  // handling eval code in comments
  const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
  const result = matchGlobalRegexWithGroupIndex(regex, originalSourceFile.getFullText())

  config.log('executeEvalCode apply matchGlobalRegexWithGroupIndex result ' + JSON.stringify(result, null, 2))

  const toPrint = result && result.length && result.map(match => {

    config.log('executeEvalCode apply doEval() result \n' + match[0] + ' and context == ' + context)
    const evalResult = doEval(match[0].value, context)

    config.log('executeEvalCode apply doEval ' + JSON.stringify(evalResult, null, 2) + evalResult.error ? ('\nERROR is: ' + evalResult.error || evalResult.errorOuter + '') : '')

    const text = prettyPrintEvalResult(evalResult)
    return { text, printPosition: match[1].end }
  })
  config.log('executeEvalCode apply return true and toPrint == ' + toPrint ? JSON.stringify(toPrint, null, 2) : 'undefined')

  if (!toPrint) {
    sourceFile.insertText(config.node.getSourceFile().getEnd(), evalHelpText)
  }
  else {
    toPrint.forEach(content => {
      sourceFile.insertText(content.printPosition, content.text)
    })
    config.log('executeEvalCode took ' + timeFrom(t0))
  }
}


const evalHelpText = `
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
`