import { NamedNode, Node, SignaturedDeclaration, SourceFile, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { findAscendant, findChildContainingRangeLight, getAscendants, getKindName, positionOrRangeToNumber, positionOrRangeToRange } from "typescript-ast-util";
import { CodeFixOptions } from 'typescript-plugin-util';
import { Action, create, Tool, ToolConfig } from "typescript-plugins-text-based-user-interaction";
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { PLUGIN_NAME, SignatureRefactorArgs, SignatureRefactorsCodeFix } from '../../refactors';
import { reorderParameters } from './reorderParams';
import {createConsumer, InputConsumer, INPUT_ACTIONS} from 'input-ui-ipc-provider'
/**
 * # Description
 * 
 *  Allows users to change a signature parameter order. see README
 * 
 * # TODO
 *  * refactor a implementation method wont change its interface signature - super 
 *  * constructors not supported
 */
export class ReorderParamsCodeFixImpl implements SignatureRefactorsCodeFix {

  private interactionTool: Tool

  name: string = PLUGIN_NAME + '-reorderParams'

  config: any = {
    // print a comment with help on the autocomplete suggestion
    help: false
  }

  private selectedAction?: Action;
  private targetNameAndReorder: { name: string; reorder: number[]; targetNode: ts.Node } | undefined;
  private inputConsumer: InputConsumer;

  constructor(private options: SignatureRefactorArgs) {
    this.inputConsumer = createConsumer({log: options.log, port: 3001})
    this.inputConsumer.askSupported()
  }

  description(arg: CodeFixOptions): string {
    return this.name
  }

  predicate(arg: CodeFixOptions): boolean {
    this.inputConsumer.askSupported()
    this.targetNameAndReorder = this.getTargetNameAndReorder(arg.sourceFile.fileName, positionOrRangeToNumber(arg.positionOrRange))
    if (!this.targetNameAndReorder) {
      arg.log('predicate false because getTargetNameAndReorder did not found anything')
      return false
    }
    return true
  }

  getCompletionsAtPosition(fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions): ts.CompletionEntry[] {
    return this.getTextUITool().getCompletionsAtPosition(fileName, position, options)
  }

  getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences): {
    refactors: ts.ApplicableRefactorInfo[];
    selectedAction?: Action;
  } {
    this.inputConsumer.askSupported()
    const applicableRefactors = this.getTextUITool().getApplicableRefactors(info, refactorName, refactorActionName, fileName, positionOrRange, userPreferences)
    this.selectedAction = applicableRefactors.selectedAction
    this.options.log('if there is no textUITool special comment it could be still a third party in' + !applicableRefactors.selectedAction + ' ' + this.targetNameAndReorder + ' ' + this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText))
    // if there is no textUITool special comment it could be still a third party input provider ?
    if (!applicableRefactors.selectedAction && this.targetNameAndReorder && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)
      // && !applicableRefactors.refactors.find(r=>r.name===refactorName && !!r.actions.find(a=>a.name===refactorActionName))
    ) {
      // this.options.log('if there is no textUITool special comment it could be still a third party in')
      // if(!applicableRefactors.refactors.find(r=>r.name===refactorName && !!r.actions.find(a=>a.name===refactorActionName))) 
      applicableRefactors.refactors.push({
        name: refactorName,
        description: `${refactorName} description`,
        actions: [{ name: refactorActionName, description: this.printRefactorSuggestionMessage(this.targetNameAndReorder.name) }]
      })
    }
    return applicableRefactors
  }

  private getTextUITool(): Tool {
    if (!this.interactionTool) {
      this.interactionTool = create(this.getTextUIToolConfig())
    }
    return this.interactionTool
  }

  private getTargetNode(fileName: string, position: number): ts.Node {
    const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
    const target = findChildContainingRangeLight(sourceFile, positionOrRangeToRange(position));
    const predicate = p => ts.isCallSignatureDeclaration(p) || ts.isFunctionLike(p) || ts.isCallOrNewExpression(p) || ts.isMethodSignature(p) || ts.isConstructSignatureDeclaration(p)
    // this.options.log('getTargetNode  concat(getAscendants, ' + [target].concat(getAscendants(target)).map(t => getKindName(t) + ' - ' + predicate(t)).join(', '))
    return findAscendant(target, predicate, true)
  }

  private getTargetNameAndReorder(fileName: string, position: number): { name: string, reorder: number[], targetNode: ts.Node } | undefined {

    let targetNode = this.getTargetNode(fileName, position)
    if (!targetNode) {
      return
    }
    let reorder = []
    let name
    if (ts.isFunctionLike(targetNode)) {
      if (!targetNode || targetNode.parameters && targetNode.parameters.length <= 1) {
        return
      }
      name = targetNode.name ? targetNode.name.getText() : (targetNode.parent && (targetNode.parent as any).name && (targetNode.parent as any).name) ? (targetNode.parent as any).name.getText() : undefined

      if (!name) {
        return
      }
      for (let i = 0; i < targetNode.parameters.length; i++) {
        reorder.push(targetNode.parameters.length - i - 1)
      }
    }
    else if (ts.isCallExpression(targetNode)) {
      if (!targetNode || targetNode.arguments && targetNode.arguments.length <= 1) {
        return
      }
      if (!ts.isIdentifier(targetNode.expression)) {
        return
      }
      name = targetNode.expression.getText()
      for (let i = 0; i < targetNode.arguments.length; i++) {
        reorder.push(targetNode.arguments.length - i - 1)
      }
    }
    //TODO: isCallNew and others that comply with : ts.isCallSignatureDeclaration(p)||ts.isFunctionLike(p)||ts.isCallOrNewExpression(p
    else {
      this.options.log('snippet undefined because not isCallExpression and not isFunctionLike' + targetNode.getText() + ' - ' + getKindName(targetNode))
      return
    }
    return { name, reorder, targetNode }
  }

  private printRefactorSuggestionMessage(name: string) {
    return `Reorder parameters of "${name}"`
  }

  private getTextUIToolConfig(): ToolConfig {
    return {
      prefix: '&%&%',
      log: this.options.log,
      actions: [
        {
          name: 'reorderParams',
          args: ['name', 'reorder'],
          commentType: 'block',
          print: action => this.printRefactorSuggestionMessage(action.args.name),

          snippet: (fileName: string, position: number): string | undefined => {
            this.targetNameAndReorder = this.getTargetNameAndReorder(fileName, position)
            if (!this.targetNameAndReorder) { return }
            const { name, reorder } = this.targetNameAndReorder

            const help = this.config.helpComment ? `
    
            /* Help: The second argument is the new order of parameters. Number N in index M means move the M-th 
                argument to index N. Examples: 
             * [1] means switch between first and second
             * [3, 2] means move the first parameter to fourth position and move the second parameter to the third. 
             *   (the rest of the parameters, (third and fourth) will move left to accommodate this requirements) */` : ''

            return `reorderParams("${name}", [${reorder.join(', ')}])${help}`
          },

          // TODO: we could give a more intuitive text-based API by letting the user provide the new signature. Then we create a new function with that signature in order to parse it correctly. 
          nameExtra: (fileName: string, position: number) => {
            if (!this.targetNameAndReorder) { return '' }
            const { name } = this.targetNameAndReorder
            return `of ${name}`
            // const func = this.getTargetNode(fileName, position)
            // if (func && ts.isFunctionLike(func)) {
            //   const name = func.name ? func.name.getText() : (func.parent && (func.parent as any).name && (func.parent as any).name) ? (func.parent as any).name.getText() : ''
            //   return `of ${name}`
            // }
            // else if (ts.isCallExpression(func)) {
            //   return `of ${func.expression ? func.expression.getText() : ''}`
            // }
            // else {
            //   return ''
            // }
          }
        }
      ]
    }
  }

  private applyImpl(arg: CodeFixOptions, reorder: number[]) {
    const sourceFile = arg.simpleNode.getSourceFile()
    const funcDecl = this.getSimpleTargetNode(sourceFile, positionOrRangeToNumber(arg.positionOrRange), this.targetNameAndReorder.name, this.options.log)
    if (!funcDecl) {
      this.options.log(`reorderParamsPlugin applyImpl aborted because function ${this.targetNameAndReorder.name} cannot be found at ${arg.positionOrRange}`)
      return
    } 
    this.options.log(`reorderParamsPlugin applyImpl calling reorderParameters with reorder: [${reorder.join(', ')}]`)
    reorderParameters(funcDecl, reorder, this.options.log);
    sourceFile.saveSync()
  }

  apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
    if (!this.selectedAction && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
      // this.options.log('this.inputConsumer.inputText before')

      this.inputConsumer.inputText({prompt: 'Enter reorderParam definition', placeHolder: '[1]'}
      // , response=>{
      //   this.options.log('this.inputConsumer.inputText cb !!! ')
      //   // this.applyImpl(arg, JSON.parse(response.answer))
      // }
    )
      .then(response=>{
        // this.options.log('this.inputConsumer.inputText then !!! 2 '+response)
        // this.options.log('this.inputConsumer.inputText then !!! ' +((response && response.answer) ? response.answer : 'undefinennen' ))
        this.applyImpl(arg, JSON.parse(response.answer))
      }).catch(ex=>{
        this.options.log('this.inputConsumer.inputText catch '+ ex)
      })
      // this.options.log('this.inputConsumer.inputText affter')
    }
    else {
      this.applyImpl(arg, this.selectedAction.args.reorder)
    }
  }

  private getSimpleTargetNode(file: SourceFile, position: number, name: string, log: (msg: string) => void): SignaturedDeclaration & NamedNode & Node | undefined {
    let expr = file.getDescendantAtPos(position)
    if (!expr) {
      return
    }
    const predicate = e => (TypeGuards.isSignaturedDeclaration(e) || TypeGuards.isPropertySignature(e) || TypeGuards.isFunctionLikeDeclaration(e)) && (TypeGuards.isNamedNode(e) || TypeGuards.isNameableNode(e) || TypeGuards.isPropertyNamedNode(e)) && (!name || e.getName() === name)
    const e = [expr].concat(expr.getAncestors()).find(predicate)
    if (!e) {
      return
    }
    return e as any
  }
}



