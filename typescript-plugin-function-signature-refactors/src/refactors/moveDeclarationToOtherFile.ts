// import { INPUT_ACTIONS } from 'input-ui-ipc-provider';
// import { Node, ts, TypeGuards } from 'ts-simple-ast';
// import { CodeFixOptions } from 'typescript-plugin-util';
// import { ToolConfig } from "typescript-plugins-text-based-user-interaction";
// import { PLUGIN_NAME } from '../refactors';
// import { SignatureAbstractCodeFix } from '../SignatureAbstractCodeFix';
// import { applyToSignature, getTargetInfo, SignatureParentType, TargetInfo } from '../util';

// /**
//  * # Description
//  * 
//  * allow user to move top-level declaration to another (existent) file
//  * 
//  * # TODO
//  */
// export class removeParamsCodeFixImpl implements SignatureAbstractCodeFix {
//   protected interactionTool;
//   protected inputConsumer;
//   protected selectedAction?;
//   protected targetInfo: TargetInfo;
//   predicate(arg: CodeFixOptions): boolean {
//     throw new Error('Method not implemented.');
//   }
//   description(arg: CodeFixOptions): string {
//     throw new Error('Method not implemented.');
//   }
//   getCompletionsAtPosition(fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions): ts.CompletionEntry[] {
//     throw new Error('Method not implemented.');
//   }
//   getTargetInfo(sourceFile: ts.SourceFile, position: number): TargetInfo {
//     throw new Error('Method not implemented.');
//   }
//   protected applyImpl(arg: CodeFixOptions, fn: (n: Node<ts.Node>) => void): void {
//     throw new Error('Method not implemented.');
//   }

//   name: string = PLUGIN_NAME + '-moveDeclarationToOtherFile'

//   config: any = {
//   }
//   remove: number[]

//   printRefactorSuggestionMessage(targetInfo: TargetInfo): string {
//     return `Move ${(targetInfo ? targetInfo.name : this.targetInfo.name)||'declaration'} to another file`
//   }

//   // getTextUIToolConfig(): ToolConfig {
//   //   return this.textUIToolConfigFactory({
//   //     name: 'moveDeclarationToOtherFile',
//   //     args: ['declarationName', 'otherFile'],
//   //     snippet: (fileName: string, position: number): string | undefined => {
//   //       return `moveDeclarationToOtherFile('DeclarationName', '../otherFile.ts')`
//   //       // const sourceFile = this.options.info.languageService.getProgram().getSourceFile(fileName)
//   //       // this.targetInfo = getTargetInfo(sourceFile, position)
//   //       // if (!this.targetInfo) { return }
//   //       // this.remove = [0]
//   //       // const help = this.config.helpComment ? this.helpComment() : ''
//   //       // return `removeParams("${this.targetInfo.name}", [${this.remove.join(', ')}])${help}`
//   //     },
//   //   })
//   // }

//   // getTargetInfo(sourceFile: ts.SourceFile, position: number): TargetInfo | undefined {
//   //   const targetInfoPredicate = (targetNode: any) => !(!targetNode || targetNode.parameters && !targetNode.parameters.length) &&
//   //     !(!targetNode || targetNode.arguments && !targetNode.arguments.length)
//   //   return getTargetInfo(sourceFile, position, targetInfoPredicate)
//   // }


//   apply(arg: CodeFixOptions): void | ts.ApplicableRefactorInfo[] {
//     if (!this.selectedAction && this.inputConsumer.hasSupport(INPUT_ACTIONS.inputText)) {
//       this.inputConsumer.inputText({ prompt: 'Enter target file', placeHolder: '../otherFile.ts'})
//         .then(response => {
//           const remove = JSON.parse(response.answer)
//           // this.applyImpl(arg, (n: Node) => { removeParameters(n, remove, this.options.log); })
//         }).catch(ex => {
//           // this.options.log('this.inputConsumer.inputText catch ' + ex)
//         })
//     }
//     else {
//       // this.applyImpl(arg, (n: Node) => { removeParameters(n, this.selectedAction.args.remove, this.options.log); })
//     }
//   }

//   helpComment(): string {
//     return ``
//   }

// }

// // function removeParameters(node: Node<ts.Node>, remove: number[], log: (msg: string) => void): any {
// //   log(`reorderParameters called with reorder: [${remove.join(', ')}]`)
// //   applyToSignature(node, (argsOrParams, parent, returnValue) => removeArgsOrParams(remove, argsOrParams, parent, log), log)
// // }

// // function removeOne(index: number, parent: SignatureParentType) {
// //   //TODO: check index - user errors
// //   if (TypeGuards.isCallExpression(parent)) {
// //     parent.removeArgument(index)
// //   }
// //   else {
// //     parent.getParameters()[index].remove()
// //   }
// // }

// // function removeArgsOrParams(remove: ReadonlyArray<number>, argsOrParams: ReadonlyArray<Node>, parent: SignatureParentType, log: (msg: string) => void) {
// //   for (let index = 0; index < remove.length; index++) {
// //     removeOne(remove[index], parent)
// //   }
// // }
