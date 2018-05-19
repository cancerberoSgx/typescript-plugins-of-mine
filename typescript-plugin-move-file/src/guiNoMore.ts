import { GetCompletionsAtPositionOptions, CompletionEntry, ScriptElementKind, ScriptElementKindModifier } from "typescript/lib/tsserverlibrary";

export interface GUINoMoreConfig{
  prefix: string
  actions: GUINoMoreActionConfig[]
}
export interface GUINoMoreActionConfig{
  /** must be a valid JavaScript identifier name */
  name: string,
  /** each must be a valid JavaScript identifier name */
  args: string[]
  /** pretty print for refactor suggestion */
  print: (action: GUINoMoreAction)=>string
  /** the example snippet to suggested for this action to the user on "refactor" autocomplete  */
  snippet: string
}
export interface GUINoMoreAction {
  name: string
  args: { [key: string]: string }
  print: ( action: GUINoMoreAction)=>string
} 
export class GUINoMore {
  constructor(config: GUINoMoreConfig){
    this.config = config
    this.config.prefix = this.config.prefix || '&%&%'
    this.buildEvalExpr()
  }
  private allActionsEvalPrefix: string
  private config: GUINoMoreConfig
  private buildEvalExpr(): void {
    this.allActionsEvalPrefix = ''
    // want to get to an string like this: function moveThisFileTo(path){return {name: 'moveThisFileTo', args: {dest: path} }};
    this.config.actions.forEach(actionConfig=>{
      this.allActionsEvalPrefix += `function ${actionConfig.name}(${actionConfig.args.join(', ')}) {return {name: '${actionConfig.name}', args: {${actionConfig.args.join(', ')}}}};\n`
    })
  }
  /**
   * find all declared actions in given file string
   * @param fileStr content of file where to find action declarations - in general obtained with `sourceFile.getText()`
   */
  public findActions(fileStr: string): GUINoMoreAction[]{
    const found: GUINoMoreAction[] = []
    const lines = fileStr.split('\n') //TODO: use new line format in tsconfig
    lines.forEach(line => {
      const i = line.indexOf(this.config.prefix)
      if (i === -1) {
        return
      }
      const userCall = line.substr(i + this.config.prefix.length, line.length)
      try {
        const result = eval(this.allActionsEvalPrefix + ';\n' + userCall)        
        if (result && typeof result === 'object') {
          const actionConfig = this.config.actions.find(a=>userCall.trim().startsWith(a.name)) // TODO: issue if two start with the same prefix 
          result.print = actionConfig.print.bind(result)
          found.push(result)
        }
      } catch (ex) {
        // console.log(ex, ex.stack)
      }
    })
    return found
  }

  public getCompletionsAtPosition(fileName:string, position: number, options: GetCompletionsAtPositionOptions | undefined): CompletionEntry[] {
    return this.config.actions.map(action=>({
      name: `refactor.${action.name}`, 
      kind: ScriptElementKind.unknown, 
      kindModifiers: ScriptElementKindModifier.none, 
      sortText: `refactor.${action.name}`,
      insertText: `// ${this.config.prefix} ${action.snippet}`
    }))
  }
}
