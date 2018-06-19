import { INPUT_ACTIONS } from 'input-ui-ipc-provider';
import { Node, ts, TypeGuards } from 'ts-simple-ast';
import { CodeFixOptions } from 'typescript-plugin-util';
import { ToolConfig } from "typescript-plugins-text-based-user-interaction";
import { PLUGIN_NAME } from '../refactors';
import { SignatureAbstractCodeFix } from '../SignatureAbstractCodeFix';
import { applyToSignature, getTargetInfo, SignatureParentType, TargetInfo } from '../util';

/**
 * # Description
 * 
 *  Allows users to remove parameters from signature/function-like declarations, calls, etc. see README
 * 
 * # TODO
 * 
 *  * refactor a implementation method wont change its interface signature - super 
 *  * constructors not supported
 *  * perhaps is better to offer a GUI multiple select ? !!!
 */
export class removeParamsCodeFixImpl extends SignatureAbstractCodeFix {

  name: string = PLUGIN_NAME + '-removeParam'

  config: any = {
    help: false
  }
  remove: number[]

  printRefactorSuggestionMessage(targetInfo: TargetInfo): string {
    return `Remove parameters of "${targetInfo ? targetInfo.name : this.targetInfo.name}"`
  }

  getTextUIToolConfig(): ToolConfig {
    return this.textUIToolConfigFactory({
      name: 'removeParams',
      args: ['name', 'remove'],
      snippet: (fileName: string, position: number): string | undefined => {
        const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
        this.targetInfo = getTargetInfo(sourceFile, position)
        if (!this.targetInfo) { return }
        this.remove = [0]
        const help = this.config.helpComment ? this.helpComment() : ''
        return `removeParams("${this.targetInfo.name}", [${this.remove.join(', ')}])${help}`
      },
    })
  }

  getTargetInfo(sourceFile: ts.SourceFile, position: number): TargetInfo | undefined {
    const targetInfoPredicate = (targetNode: any) => !(!targetNode || targetNode.parameters && !targetNode.parameters.length) &&
      !(!targetNode || targetNode.arguments && !targetNode.arguments.length)
    return getTargetInfo(sourceFile, position, targetInfoPredicate)
  }


  apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
    if (!this.selectedAction && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
      this.inputConsumer.inputText({ prompt: 'Enter removeParam definition', placeHolder: '[1]' })
        .then(response => {
          const remove = JSON.parse(response.answer)
          this.applyImpl(arg, (n: Node) => { removeParameters(n, remove, this.options.log); })
        }).catch(ex => {
          this.options.log('this.inputConsumer.inputText catch ' + ex)
        })
    }
    else {
      this.applyImpl(arg, (n: Node) => { removeParameters(n, this.selectedAction.args.remove, this.options.log); })
    }
  }

  helpComment(): string {
    return `/* Help: [1] means remove second argument/parameter, [0, 2] means remove first and third, etc */`
  }

}

function removeParameters(node: Node<ts.Node>, remove: number[], log: (msg: string) => void): any {
  log(`reorderParameters called with reorder: [${remove.join(', ')}]`)
  applyToSignature(node, (argsOrParams, parent, returnValue) => removeArgsOrParams(remove, argsOrParams, parent, log), log)
}

function removeOne(index: number, parent: SignatureParentType) {
  //TODO: check index - user errors
  if (TypeGuards.isCallExpression(parent)) {
    parent.removeArgument(index)
  }
  else {
    parent.getParameters()[index].remove()
  }
}

function removeArgsOrParams(remove: ReadonlyArray<number>, argsOrParams: ReadonlyArray<Node>, parent: SignatureParentType, log: (msg: string) => void) {
  for (let index = 0; index < remove.length; index++) {
    removeOne(remove[index], parent)
  }
}
