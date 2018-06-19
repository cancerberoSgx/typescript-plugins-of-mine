import { InputConsumer, INPUT_ACTIONS } from 'input-ui-ipc-provider';
import { NamedNode, Node, SignaturedDeclaration, SourceFile, TypeGuards } from 'ts-simple-ast';
import * as ts from 'typescript';
import { positionOrRangeToNumber } from "typescript-ast-util";
import { CodeFixOptions } from 'typescript-plugin-util';
import { Action, create, Tool, ToolConfig } from "typescript-plugins-text-based-user-interaction";
import * as ts_module from 'typescript/lib/tsserverlibrary';
import { getInputConsumer, setLogger } from './inputConsumer';
import { SignatureRefactorArgs, SignatureRefactorsCodeFix } from './refactors';
import { getTargetInfo, TargetInfo } from './util';

export abstract class SignatureAbstractCodeFix implements SignatureRefactorsCodeFix {

  protected interactionTool: Tool
  protected inputConsumer: InputConsumer;
  protected selectedAction?: Action;
  protected targetInfo: TargetInfo | undefined;

  name: string
  config: any

  constructor(protected options: SignatureRefactorArgs) {
    setLogger(options.log)
    this.inputConsumer = getInputConsumer()
    this.interactionTool = create(this.getTextUIToolConfig())
    options.log('SignatureAbstractCodeFix constructor finish')
  }

  abstract getTextUIToolConfig(): ToolConfig

  abstract apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[]

  abstract printRefactorSuggestionMessage(targetInfo: TargetInfo): string

  predicate(arg: CodeFixOptions): boolean {
    this.inputConsumer.askSupported()
    this.targetInfo = getTargetInfo(arg.sourceFile, positionOrRangeToNumber(arg.positionOrRange))
    if (!this.targetInfo) {
      arg.log('predicate false because getTargetNameAndReorder did not found anything')
      return false
    }
    return true
  }

  description(arg: CodeFixOptions): string {
    return this.name
  }

  getCompletionsAtPosition(fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions): ts.CompletionEntry[] {
    return this.interactionTool.getCompletionsAtPosition(fileName, position, options)
  }

  // protected getTextUITool(): Tool {
  //   if (!this.interactionTool) {
  //     this.interactionTool = create(this.getTextUIToolConfig())
  //   }
  //   return this.interactionTool
  // }

  protected getSimpleTargetNode(file: SourceFile, position: number, name: string, log: (msg: string) => void): SignaturedDeclaration & NamedNode & Node | undefined {
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


  getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences): {
    refactors: ts.ApplicableRefactorInfo[];
    selectedAction?: Action;
  } {
    this.inputConsumer.askSupported()
    const applicableRefactors = this.interactionTool.getApplicableRefactors(info, refactorName, refactorActionName, fileName, positionOrRange, userPreferences)
    this.selectedAction = applicableRefactors.selectedAction

    // this.options.log('if there is no textUITool special comment it could be still a third party in' + !applicableRefactors.selectedAction + ' ' + this.targetNameAndReorder + ' ' + this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText))

    // if there is no textUITool special comment it could be still a third party input provider ?
    if (!applicableRefactors.selectedAction && this.targetInfo && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
      applicableRefactors.refactors.push({
        name: refactorName,
        description: `${refactorName} description`,
        actions: [{ name: refactorActionName, description: this.printRefactorSuggestionMessage(this.targetInfo) }]
      })
    }
    return applicableRefactors
  }

}

