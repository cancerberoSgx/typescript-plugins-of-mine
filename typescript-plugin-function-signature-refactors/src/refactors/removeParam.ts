// import { NamedNode, Node, SignaturedDeclaration, SourceFile, TypeGuards } from 'ts-simple-ast';
// import * as ts from 'typescript';
// import { findAscendant, findChildContainingRangeLight, getAscendants, getKindName, positionOrRangeToNumber, positionOrRangeToRange } from "typescript-ast-util";
// import { CodeFixOptions } from 'typescript-plugin-util';
// import { Action, create, Tool, ToolConfig } from "typescript-plugins-text-based-user-interaction";
// import * as ts_module from 'typescript/lib/tsserverlibrary';
// import { PLUGIN_NAME, SignatureRefactorArgs, SignatureRefactorsCodeFix } from '../../refactors';
// import { reorderParameters } from './reorderParams';
// import {createConsumer, InputConsumer, INPUT_ACTIONS} from 'input-ui-ipc-provider'
// import { getTargetInfo } from '../util';
// /**
//  * # Description
//  * 
//  *  Allows users to change a signature parameter order. see README
//  * 
//  * # TODO
//  *  * refactor a implementation method wont change its interface signature - super 
//  *  * constructors not supported
//  */
// export class ReorderParamsCodeFixImpl implements SignatureRefactorsCodeFix {

//   private interactionTool: Tool

//   name: string = PLUGIN_NAME + '-reorderParams'

//   config: any = {
//     // print a comment with help on the autocomplete suggestion
//     help: false
//   }

//   // private selectedAction?: Action;
//   // private targetNameAndReorder: { name: string;< reorder: number[]; targetNode: ts.Node } | undefined;
//   private inputConsumer: InputConsumer;

//   constructor(private options: SignatureRefactorArgs) {
//     this.inputConsumer = createConsumer({log: options.log, port: 3001})
//     this.inputConsumer.askSupported()
//   }

//   description(arg: CodeFixOptions): string {
//     return this.name
//   }

//   predicate(arg: CodeFixOptions): boolean {
//     this.inputConsumer.askSupported()
//     const targetInfo = getTargetInfo(sourceFile, positionOrRangeToNumber(arg.positionOrRange))

//     this.targetNameAndReorder = this.getTargetNameAndReorder(arg.sourceFile.fileName, positionOrRangeToNumber(arg.positionOrRange))
//     if (!this.targetNameAndReorder) {
//       arg.log('predicate false because getTargetNameAndReorder did not found anything')
//       return false
//     }
//     return true
//   }

//   getCompletionsAtPosition(fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions): ts.CompletionEntry[] {
//     return this.getTextUITool().getCompletionsAtPosition(fileName, position, options)
//   }

//   getApplicableRefactors(info: ts_module.server.PluginCreateInfo, refactorName: string, refactorActionName: string, fileName: string, positionOrRange: number | ts.TextRange, userPreferences: ts_module.UserPreferences): {
//     refactors: ts.ApplicableRefactorInfo[];
//     selectedAction?: Action;
//   } {
//     this.inputConsumer.askSupported()
//     const applicableRefactors = this.getTextUITool().getApplicableRefactors(info, refactorName, refactorActionName, fileName, positionOrRange, userPreferences)
//     this.selectedAction = applicableRefactors.selectedAction
//     this.options.log('if there is no textUITool special comment it could be still a third party in' + !applicableRefactors.selectedAction + ' ' + this.targetNameAndReorder + ' ' + this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText))
//     // if there is no textUITool special comment it could be still a third party input provider ?
//     if (!applicableRefactors.selectedAction && this.targetNameAndReorder && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)
//       // && !applicableRefactors.refactors.find(r=>r.name===refactorName && !!r.actions.find(a=>a.name===refactorActionName))
//     ) {
//       // this.options.log('if there is no textUITool special comment it could be still a third party in')
//       // if(!applicableRefactors.refactors.find(r=>r.name===refactorName && !!r.actions.find(a=>a.name===refactorActionName))) 
//       applicableRefactors.refactors.push({
//         name: refactorName,
//         description: `${refactorName} description`,
//         actions: [{ name: refactorActionName, description: this.printRefactorSuggestionMessage(this.targetNameAndReorder.name) }]
//       })
//     }
//     return applicableRefactors
//   }
// }