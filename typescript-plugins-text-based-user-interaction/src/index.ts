import ts_module, { CompletionEntry, GetCompletionsAtPositionOptions, ScriptElementKind, ScriptElementKindModifier, UserPreferences } from "typescript/lib/tsserverlibrary";

export interface ToolConfig {
  prefix: string
  log?: (msg: string) => void
  actions: ActionConfig[]
  /** prefix to suggest completion - "refactor" by default */
  completionPrefix?: string
  completionContextFromAst?: (fileName: string, position: number) => {}
}
export interface ActionConfig {
  /** must be a valid JavaScript identifier name */
  name: string,
  /** each must be a valid JavaScript identifier name */
  args: string[]
  /** pretty print for refactor suggestion */
  print: (action: Action) => string
  /** the example snippet to suggested for this action to the user on "refactor" autocomplete  */
  snippet: string | ((fileName: string, position: number) => string | undefined)
  nameExtra?: string | ((fileName: string, position: number) => string)
  commentType?: 'line' | 'block' 
}

export interface Action {
  name: string
  args: { [key: string]: any }
  print: (action: Action) => string
}
export function create(config: ToolConfig): Tool {
  return new ToolImpl(config)
}
export interface Tool {
  /** return all actions found in given file text */
  findActions(fileStr: string): Action[]
  /** helper for generating the complationsAtPosition suggested to the user to prototype its input inquisition */
  getCompletionsAtPosition(fileName: string, position: number, options: GetCompletionsAtPositionOptions | undefined): CompletionEntry[]
  /** helper that implements a generic langauge service method getApplicableRefactors */
  getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: UserPreferences)
    : { refactors: ts.ApplicableRefactorInfo[], selectedAction?: Action };
}

class ToolImpl implements Tool {
  constructor(private config: ToolConfig) {
    this.config.prefix = this.config.prefix || '&%&%'
    this.config.log = this.config.log || ((msg: string) => { })
    this.config.actions.forEach(a=>{a.commentType = a.commentType || 'line'})
    this.buildEvalExpr()
  }
  private allActionsEvalPrefix: string

  private buildEvalExpr(): void {
    this.allActionsEvalPrefix = ''
    // want to get to an string like this: function moveThisFileTo(path){return {name: 'moveThisFileTo', args: {dest: path} }};
    this.config.actions.forEach(actionConfig => {
      this.allActionsEvalPrefix += `function ${actionConfig.name}(${actionConfig.args.join(', ')}) {return {name: '${actionConfig.name}', args: {${actionConfig.args.join(', ')}}}};\n`
    })
  }


  /**
   * find all declared actions in given file string
   * @param fileStr content of file where to find action declarations - in general obtained with `sourceFile.getText()`
   */
  public findActions(fileStr: string): Action[] {
    return buildUserCalls(fileStr, this.config).map(userCall => {
      try {
        const toEval = this.allActionsEvalPrefix + ';\n' + userCall
        this.config.log('findActions toEval ' + toEval)
        const result = eval(toEval)
        if (result && typeof result === 'object') {
          const actionConfig = this.config.actions.find(a => userCall.trim().startsWith(a.name)) // TODO: issue if two start with the same prefix 
          result.print = actionConfig.print.bind(result)
          return result
        }
        else {
          this.config.log('findActions ignoring eval result because is not an object ' + result)
        }
      } catch (ex) {
        this.config.log('findActions eval error ' + ex + ' - ' + ex.stack)
      }
    }).filter(a => a!==undefined)
  }

  public getCompletionsAtPosition(fileName: string, position: number, options: GetCompletionsAtPositionOptions | undefined): CompletionEntry[] { 
    const completionPrefix = this.config.completionPrefix || 'refactor'
    const result = this.config.actions.map(action => {
      let insertText = []
      const snippet = typeof action.snippet === 'function' ? (action.snippet as any)(fileName, position) : action.snippet
      if (!snippet) {
        this.config.log('getCompletionsAtPosition aborted because !snippet')
        return
      }
      const splitted = snippet.split('\n')
      for (let i = 0; i < splitted.length; i++) {
        if( action.commentType === 'line'){
          insertText.push(`// ${this.config.prefix} ${splitted[i]}`)
        }
        if( action.commentType === 'block'){
          insertText.push(`\n/* ${this.config.prefix} ${splitted[i]} */\n`)
        }
      }
      const name = `${completionPrefix} ${action.name} ${typeof action.nameExtra === 'function' ? action.nameExtra(fileName, position) : action.nameExtra || ''}`
      return {
        name,
        kind: ScriptElementKind.unknown,
        kindModifiers: ScriptElementKindModifier.none,
        sortText: name,
        insertText: insertText.join('\n')
      } as CompletionEntry
    })
    .filter(a => !!a)

    // this.config.log && this.config.log(`TEXT getCompletionsAtPosition ${result.map(r=>JSON.stringify(r)).join(', ')}`)
    return result

  }


  public getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: UserPreferences)
    : { refactors: ts.ApplicableRefactorInfo[], selectedAction?: Action } {

    const refactors = info.languageService.getApplicableRefactors(fileName, positionOrRange, userPreferences) || []
    const program = info.languageService.getProgram()
    const sourceFile = program.getSourceFile(fileName)
    if (!sourceFile) {
      return { refactors }
    }
    const actions = this.findActions(sourceFile.getText())
    if (!actions || actions.length === 0) {
      return { refactors }
    }
    const selectedAction = actions[0]
    const refactorActions = [{ name: refactorActionName, description: selectedAction.print(selectedAction) }]
    refactors.push({
      name: refactorName,
      description: `${refactorName} description`,
      actions: refactorActions
    })
    return { refactors, selectedAction }
  }

}


export function buildUserCalls(fileStr: string, config: ToolConfig): string[] { // public and exported so we can test it
  const lines = fileStr.split('\n') //TODO: use new line format in tsconfig
  let userCalls: string[] = []
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex].trim();
    let i = line.indexOf(config.prefix)
    if (i === -1) {
      continue
    }
    let userCall = line.substr(i + config.prefix.length, line.length)
    userCall = userCall.endsWith('*/') ? userCall.substring(0, userCall.length-3) : userCall
    for (lineIndex = lineIndex + 1; lineIndex < lines.length; lineIndex++) {
      line = lines[lineIndex]
      const i = line.indexOf(config.prefix)
      if (i === -1) {
        userCalls.push(userCall)
        break
      }
      userCall += '\n' + line.substr(i + config.prefix.length, line.length)
    }
  }
  return userCalls
}

