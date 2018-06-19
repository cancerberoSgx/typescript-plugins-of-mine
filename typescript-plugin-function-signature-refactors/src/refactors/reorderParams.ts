import { INPUT_ACTIONS } from 'input-ui-ipc-provider';
import { Node } from "ts-simple-ast";
import * as ts from 'typescript';
import { CodeFixOptions, getName } from 'typescript-plugin-util';
import { ActionConfig, ToolConfig } from "typescript-plugins-text-based-user-interaction";
import { PLUGIN_NAME } from '../refactors';
import { SignatureAbstractCodeFix } from '../SignatureAbstractCodeFix';
import { applyToSignature, getTargetInfo, TargetInfo } from '../util';

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



  name: string = PLUGIN_NAME + '-reorderParams'

  config: any = {
    // print a comment with help on the autocomplete suggestion
    help: false
  }

  getTargetInfo(sourceFile: ts.SourceFile, position: number): TargetInfo | undefined {
    const targetInfoPredicate = (targetNode: any) => !(!targetNode || targetNode.parameters && targetNode.parameters.length <= 1) && !(!targetNode || targetNode.arguments && targetNode.arguments.length <= 1)
    return getTargetInfo(sourceFile, position, targetInfoPredicate)
  }

  private getTargetNameAndReorder(fileName: string, position: number): TargetInfo & { reorder: number[] } | undefined {
    const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
    let targetInfo = this.getTargetInfo(sourceFile, position)
    if (!targetInfo) {
      return
    }
    let reorder = []
    const L = targetInfo.argumentCount || targetInfo.parameterCount
    for (let i = 0; i < L; i++) {
      reorder.push(L - i - 1)
    }
    const result = Object.assign({}, targetInfo, { reorder })

    this.targetInfo = result
    this.reorder = result.reorder
    return result
  }

  printRefactorSuggestionMessage(targetInfo: TargetInfo): string {
    return `Reorder parameters of "${targetInfo ? targetInfo.name : this.targetInfo.name}"`
  }

  getTextUIToolConfig(): ToolConfig {
    return this.textUIToolConfigFactory({
      name: 'reorderParams',
      args: ['name', 'reorder'],
      snippet: (fileName: string, position: number): string | undefined => {
        const result = this.getTargetNameAndReorder(fileName, position)
        if (!result) { return }
        const help = this.config.helpComment ? this.helpComment() : ''
        return `reorderParams("${this.targetInfo.name}", [${this.reorder.join(', ')}])${help}`
      },
    })
  }

  textUIToolConfigFactory(config: Partial<ActionConfig>) {
    const defaultConfig = {
      name: 'generic',
      args: ['name'],
      commentType: 'block',
      print: action => this.printRefactorSuggestionMessage(Object.assign({}, this.targetInfo, { name: action && action.args && action.args.name || this.targetInfo && this.targetInfo.name || 'unknown' })),
      snippet: (fileName: string, position: number): string | undefined => {
        const result = this.getTargetNameAndReorder(fileName, position)
        if (!result) { return }
        const help = this.config.helpComment ? this.helpComment() : ''
        return `reorderParams("${this.targetInfo.name}")${help}`
      },
      nameExtra: (fileName: string, position: number) => {
        if (!this.targetInfo) {
          return ''
        }
        return `of ${this.targetInfo.name}`
      }
    }
    return {
      prefix: '&%&%',
      log: this.options.log,
      actions: [Object.assign({}, defaultConfig, config)]
    }
  }

  helpComment(): string {
    return `
    
  /* Help: The second argument is the new order of parameters. Number N in index M means move the M-th 
      argument to index N. Examples: 
   * [1] means switch between first and second
   * [3, 2] means move the first parameter to fourth position and move the second parameter to the third. 
   *   (the rest of the parameters, (third and fourth) will move left to accommodate this requirements) */`
  }

  apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
    if (!this.selectedAction && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
      this.inputConsumer.inputText({ prompt: 'Enter reorderParam definition', placeHolder: '[1]' })
        .then(response => {
          const reorder = JSON.parse(response.answer)
          this.applyImpl(arg, (n: Node) => { reorderParameters(n, reorder, this.options.log); })
        }).catch(ex => {
          this.options.log('this.inputConsumer.inputText catch ' + ex)
        })
    }
    else {

      this.applyImpl(arg, (n: Node) => { reorderParameters(n, this.selectedAction.args.reorder, this.options.log); })
    }
  }
}


// the following code isolates the AST manipulation for this plugin apply()

/**
 * For all references that must be refactored calls changeCallArgs.
 * 
 * TODO: check that user is not removing parameters. For example, this is invalid in a three 
 * parameter function : [1, 2] 
 * because the first parameter will be removed. Or throw exception or touch the reorder argument so it contains them all 
 * @param targetDeclaration the function-like declaration to reorder its parameters
 * @param reorder [1,0] means switching the positions between first and second params
 */
export function reorderParameters(node: Node, reorder: number[], log: (msg: string) => void): void {
  log(`reorderParameters called with reorder: [${reorder.join(', ')}]`)
  applyToSignature(node, (argsOrParams: ReadonlyArray<Node>) => changeCallArgs(reorder, argsOrParams, log), log)
}

function changeCallArgs(reorder: ReadonlyArray<number>, args: ReadonlyArray<Node>, log: (msg: string) => void) {
  type T = { index: number, arg: string, name: string, remove?: boolean, originalIndex: number }

  // will use indexOccupied to reassign new positions to those nodes that must move implicitly
  let indexOccupied = new Array(args.length).fill(-1)
  reorder.forEach((r, i) => {
    if (r >= indexOccupied.length) {
      //user error provided incorrect reorder array
    }
    indexOccupied[r] = i
  })
  function findNextFreeIndexFor(index: number) {
    const id = indexOccupied.indexOf(-1)
    indexOccupied[id] = index
    return id
  }
  // reorderedArgs will have metadata regarding the new params/args locations
  let reorderedArgs: T[] = args.map((arg, i) => {
    if (i < reorder.length) {
      return {
        index: reorder[i],
        originalIndex: i,
        arg: arg.getText(),
        name: getName(arg)
      }
    }
  }).filter(a => !!a)

  // missingArgs contains  metadata regarding those nodes that must implicitly move
  const missingArgs: T[] = args.map((arg, index) => {
    if (index >= reorder.length) {
      const newIndex = findNextFreeIndexFor(index)
      return {
        index: newIndex,
        originalIndex: index,
        arg: arg.getText(),
        name: getName(arg)
      }
    }
  }).filter(a => !!a)
  reorderedArgs = reorderedArgs.concat(missingArgs)

  const replacements: { node: Node, text: string, remove?: boolean }[] = []
  args.forEach((a, index) => {
    const arg = reorderedArgs.find(r => r.index === index)
    if (arg) {
      replacements.push({ node: args[arg.index], text: arg.arg })
    } else {
      log('changeCallArgs ignoring arg: ' + a.getKindName() + ' - text: ' + a.getText() + ' - arg found: ' + (arg && arg.remove))
    }
  })
  for (const r of replacements) {
    r.node.replaceWithText(r.text)
  }
}
