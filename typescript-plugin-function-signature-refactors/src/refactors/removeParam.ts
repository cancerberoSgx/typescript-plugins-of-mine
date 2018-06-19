import { INPUT_ACTIONS } from 'input-ui-ipc-provider';
import { positionOrRangeToNumber } from "typescript-ast-util";
import { CodeFixOptions } from 'typescript-plugin-util';
import { ToolConfig } from "typescript-plugins-text-based-user-interaction";
import { PLUGIN_NAME } from '../refactors';
import { SignatureAbstractCodeFix } from '../SignatureAbstractCodeFix';
import { getTargetInfo, TargetInfo } from '../util';
import { SignaturedDeclaration, NamedNode, Node, ts } from 'ts-simple-ast';

/**
 * # Description
 * 
 *  Allows users to remove parameters from signature/function-like declarations, calls, etc. see README
 * 
 * # TODO
 * 
 *  * refactor a implementation method wont change its interface signature - super 
 *  * constructors not supported
    * we could give a more intuitive text-based API by letting the user provide the new signature. Then we create a new function with that signature in order to parse it correctly. 
 */
export class removeParamsCodeFixImpl extends SignatureAbstractCodeFix {

  name: string = PLUGIN_NAME + '-removeParam'

  config: any = {
  }

  private getTargetNameAndremove(fileName: string, position: number): TargetInfo & { remove: number[] } | undefined {
    const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
    let targetInfo = getTargetInfo(sourceFile, position)
    if (!targetInfo) {
      return
    }
    let remove = []
    const L = targetInfo.argumentCount || targetInfo.parameterCount
    for (let i = 0; i < L; i++) {
      remove.push(L - i - 1)
    }
    return Object.assign({}, targetInfo, { remove })
  }

  printRefactorSuggestionMessage(targetInfo: TargetInfo): string {
    return `Remove parameters of "${targetInfo ? targetInfo.name : this.targetInfo.name}"`
  }

  getTextUIToolConfig(): ToolConfig {
    return {
      prefix: '&%&%',
      log: this.options.log,
      actions: [
        {
          name: 'removeParams',
          args: ['name', 'remove'],
          commentType: 'block',

          print: action => this.printRefactorSuggestionMessage(Object.assign({}, this.targetInfo, {name: action && action.args && action.args.name ||this.targetInfo && this.targetInfo.name || 'unknown'})),

          snippet: (fileName: string, position: number): string | undefined => {
            const result = this.getTargetNameAndremove(fileName, position)
            if (!result) { return }
            this.targetInfo = result
            return `removeParams("${this.targetInfo.name}", [0])`
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

  private applyImpl(arg: CodeFixOptions, remove: number[]) {
    const sourceFile = arg.simpleNode.getSourceFile()
    const funcDecl = this.getSimpleTargetNode(sourceFile, positionOrRangeToNumber(arg.positionOrRange), this.targetInfo.name, this.options.log)
    if (!funcDecl) {
      this.options.log(`removeParamsPlugin applyImpl aborted because function ${this.targetInfo.name} cannot be found at ${arg.positionOrRange}`)
      return
    }
    this.options.log(`removeParamsPlugin applyImpl calling removeParameters with remove: [${remove.join(', ')}]`)
    this.removeParameters(funcDecl, remove, this.options.log)
    sourceFile.saveSync()
  }

  getTargetInfo(sourceFile: ts.SourceFile, position: number): TargetInfo | undefined {
    const targetInfoPredicate = (targetNode: any) => !(!targetNode || targetNode.parameters && !targetNode.parameters.length) && !(!targetNode || targetNode.arguments && !targetNode.arguments.length)
    return getTargetInfo(sourceFile, position, targetInfoPredicate)
  }
  
  apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
    if (!this.selectedAction && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
      this.inputConsumer.inputText({ prompt: 'Enter removeParam definition', placeHolder: '[1]' })
        .then(response => {
          const remove = JSON.parse(response.answer)
          this.applyImpl(arg, remove)
        }).catch(ex => {
          this.options.log('this.inputConsumer.inputText catch ' + ex)
        })
    }
    else {
      this.applyImpl(arg, this.selectedAction.args.remove)
    }
  }


  removeParameters(node: SignaturedDeclaration & NamedNode & Node<ts.Node>, remove: number[], log: (msg:string)=>void): any {
    throw new Error('Method not implemented.');
  }
}
