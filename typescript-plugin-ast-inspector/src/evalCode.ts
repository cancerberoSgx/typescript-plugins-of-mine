
// TODO: eval code safely using node vm so security people dont complain
// TODO: eval current function code - so user don't have to excatly select everything
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
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { EvalContextUtil, EvalContextUtilImpl } from './evalCodeContextUtil';
import { matchGlobalRegexWithGroupIndex } from './regex-groups-index';

export const EVAL_CODE_IN_COMMENTS_REFACTOR_ACTION_NAME = `plugin-ast-inspector-eval-code-in-comments`
export const EVAL_SELECTION_REFACTOR_ACTION_NAME = `plugin-ast-inspector-eval-selection`
export const EVAL_CURRENT_FUNCTION_BODY_REFACTOR_ACTION_NAME = `plugin-ast-inspector-eval-current-function-body`

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


let _printed = []
class EvalContextImpl implements EvalContext {
  ts = ts
  tsa = sts
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
    _printed = []
  }
  print(s): void {
    _printed.push(s+'') // use an external variable so users can do const print = c.print - in general we dont want to use "this". TODO: probably we dont want to use a "class" just an object
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
  try {// TODO: get how much time it took and print it back in the output
    eval(codeToEval)
  } catch (ex) {
    __context__.log('executeEvalCode, eval error (outer): ' + ex + ' - ' + JSON.stringify(ex))
    __result__.errorOuter = ex
  }
  __result__.output = _printed
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
  // const saved = originalSourceFile.getFullText().trim() === readFileSync(originalSourceFile.fileName).toString().trim()
  // // handle file not saved - we need the file to be saved in order to use simple-ast properly
  // if (!saved) {
  //   sourceFile.insertText(config.node.getEnd(), `/* Please save the file before evaluating code, thanks */`)
  // }
  // handle eval function body
  if (config.actionName === EVAL_CURRENT_FUNCTION_BODY_REFACTOR_ACTION_NAME) {
    let targetFunction = (config.node.getKind() === ts.SyntaxKind.FunctionDeclaration ? config.node : undefined) || config.node.getFirstAncestorByKind(ts.SyntaxKind.FunctionDeclaration)
    if(!targetFunction){
      // if we are not inside a function declaration we evaluate the body of the first function declaration in this file
      targetFunction = sourceFile.getFirstDescendantByKind(ts.SyntaxKind.FunctionDeclaration)
    }
    if (!targetFunction || !sts.TypeGuards.isFunctionDeclaration(targetFunction)) {
      return
    }
    const text = evalCodeAndPrintResult(config, targetFunction.getBody().getText())
    sourceFile.insertText(targetFunction.getEnd(), text)
  }
  // handle eval selected code
  else if (config.actionName === EVAL_SELECTION_REFACTOR_ACTION_NAME && typeof (config.positionOrRange as ts.TextRange).pos === 'number') {
    const range = config.positionOrRange as ts.TextRange
    const text = evalCodeAndPrintResult(config, originalSourceFile.getFullText().substring(range.pos, range.end))
    sourceFile.insertText(range.end, text)
    return
  }
  // handle eval code in comments
  else {
    const regex = /\/\*\*\*@\s*([^@]+)\s*(@\*\*\*\/)/gim
    const result = matchGlobalRegexWithGroupIndex(regex, originalSourceFile.getFullText())
    config.log('executeEvalCode apply matchGlobalRegexWithGroupIndex result ' + JSON.stringify(result, null, 2))
    const toPrint = result && result.length && result.map(match => {
      return { text: evalCodeAndPrintResult(config, match[0].value), printPosition: match[1].end }
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
}

function evalCodeAndPrintResult(config: EvalContextConfig, code: string): string {
  const context = new EvalContextImpl(config)
  config.log('executeEvalCode evaluating selected code: ' + code)
  const result = doEval(code, context) //TODO: not logging time & error
  const text = prettyPrintEvalResult(result)
  config.log('executeEvalCode after evaluating selected code result is: ' + JSON.stringify(result, null, 2))
  return text
}

const evalHelpText = `
/***@ 
 // For evaluating code you can use a comment with a format like this one, (see how starts with "/*** followed
 // by "at") You could have many of these comments as this one as long they contain VALID JAVASCRIPT (this is
 // why we use line comments inside for this internal comments) IMPORTANT: make sure you save the file before
 // evaluating code - if not the content in editor buffer will be different (older) than filesystem (most
 // editors handle this OK but be advised) 
 
 //You have a "c" variable with a context object with useful utilities, among others:TODO: IEvalContext apidocs)

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