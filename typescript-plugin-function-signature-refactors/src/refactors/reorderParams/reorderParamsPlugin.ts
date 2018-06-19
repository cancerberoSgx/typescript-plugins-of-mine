import { INPUT_ACTIONS } from 'input-ui-ipc-provider';
import * as ts from 'typescript';
import { positionOrRangeToNumber } from "typescript-ast-util";
import { CodeFixOptions } from 'typescript-plugin-util';
import { ToolConfig } from "typescript-plugins-text-based-user-interaction";
import { PLUGIN_NAME } from '../../refactors';
import { SignatureAbstractCodeFix } from '../../SignatureAbstractCodeFix';
import { getTargetInfo, TargetInfo } from '../../util';
import { reorderParameters } from './reorderParams';

/**
 * # Description
 * 
 *  Allows users to change a signature parameter order. see README
 * 
 * # TODO
 *  * refactor a implementation method wont change its interface signature - super 
 *  * constructors not supported
    * we could give a more intuitive text-based API by letting the user provide the new signature. Then we create a new function with that signature in order to parse it correctly. 
 */
export class ReorderParamsCodeFixImpl extends SignatureAbstractCodeFix {

  private reorder: number[];
  private helpComment: string = `
    
  /* Help: The second argument is the new order of parameters. Number N in index M means move the M-th 
      argument to index N. Examples: 
   * [1] means switch between first and second
   * [3, 2] means move the first parameter to fourth position and move the second parameter to the third. 
   *   (the rest of the parameters, (third and fourth) will move left to accommodate this requirements) */`;


  name: string = PLUGIN_NAME + '-reorderParams'

  config: any = {
    // print a comment with help on the autocomplete suggestion
    help: false
  }


  private getTargetNameAndReorder(fileName: string, position: number): TargetInfo & { reorder: number[] } | undefined {
    const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
    let targetInfo = getTargetInfo(sourceFile, position)
    if (!targetInfo) {
      return
    }
    let reorder = []
    const L = targetInfo.argumentCount || targetInfo.parameterCount
    for (let i = 0; i < L; i++) {
      reorder.push(L - i - 1)
    }
    return Object.assign({}, targetInfo, { reorder })
  }

  printRefactorSuggestionMessage(targetInfo: TargetInfo): string {
    return `Reorder parameters of "${targetInfo ? targetInfo.name : this.targetInfo.name}"`
  }

  getTextUIToolConfig(): ToolConfig {
    return {
      prefix: '&%&%',
      log: this.options.log,
      actions: [
        {
          name: 'reorderParams',
          args: ['name', 'reorder'],
          commentType: 'block',

          print: action => this.printRefactorSuggestionMessage(Object.assign({}, this.targetInfo, {name: action && action.args && action.args.name ||this.targetInfo && this.targetInfo.name || 'unknown'})),

          snippet: (fileName: string, position: number): string | undefined => {
            const result = this.getTargetNameAndReorder(fileName, position)
            if (!result) { return }
            this.targetInfo = result
            this.reorder = result.reorder
            const help = this.config.helpComment ? this.helpComment : ''
            return `reorderParams("${this.targetInfo.name}", [${this.reorder.join(', ')}])${help}`
          },

          nameExtra: (fileName: string, position: number) => {
            if (!this.targetInfo) { 
              return '' 
            }
            return `of ${this.targetInfo.name}`
          }
        }
      ]
    }
  }

  private applyImpl(arg: CodeFixOptions, reorder: number[]) {
    const sourceFile = arg.simpleNode.getSourceFile()
    const funcDecl = this.getSimpleTargetNode(sourceFile, positionOrRangeToNumber(arg.positionOrRange), this.targetInfo.name, this.options.log)
    if (!funcDecl) {
      this.options.log(`reorderParamsPlugin applyImpl aborted because function ${this.targetInfo.name} cannot be found at ${arg.positionOrRange}`)
      return
    }
    this.options.log(`reorderParamsPlugin applyImpl calling reorderParameters with reorder: [${reorder.join(', ')}]`)
    reorderParameters(funcDecl, reorder, this.options.log);
    sourceFile.saveSync()
  }

  apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
    if (!this.selectedAction && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
      this.inputConsumer.inputText({ prompt: 'Enter reorderParam definition', placeHolder: '[1]' })
        .then(response => {
          const reorder = JSON.parse(response.answer)
          this.applyImpl(arg, reorder)
        }).catch(ex => {
          this.options.log('this.inputConsumer.inputText catch ' + ex)
        })
    }
    else {
      this.applyImpl(arg, this.selectedAction.args.reorder)
    }
  }
}
