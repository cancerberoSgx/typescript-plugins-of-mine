// import { InputProviderImpl, InputSupport, InputTextResponse, InputTextOptions, MessageBoxOptions, MessageBoxResponse, SelectTextOptions, SelectTextResponse } from 'input-ui-ipc-provider'
// import * as vscode from 'vscode';

// /**
//  * Probably with time if this grows and we want to reuse it we want to move it to its own project
//  */
// export class VsCodeInputProvider extends InputProviderImpl {
//   private supports: InputSupport = {
//     inputText: true,
//     askSupported: true,
//     messageBox: true,
//     selectText: true
//   }

//   askSupported(): Promise<InputSupport> {
//     return Promise.resolve(this.supports)
//   }

//   inputText(options: InputTextOptions): Promise<InputTextResponse> {
//     return new Promise(resolve => {
//       vscode.window.showInputBox(options).then(answer => resolve({ answer }))
//     })
//   }

//   messageBox(options: MessageBoxOptions): Promise<MessageBoxResponse> {
//     return new Promise(resolve => {
//       const opts = { modal: options.modal }
//       let promise: Thenable<string | undefined> | undefined
//       if (options.type === 'error') {
//         promise = vscode.window.showErrorMessage(options.message, opts)
//       }
//       else if (options.type === 'warning') {
//         promise = vscode.window.showWarningMessage(options.message, opts)
//       }
//       else {
//         promise = vscode.window.showInformationMessage(options.message, opts)
//       }
//       promise.then(result => {
//         resolve({ answer: !!result })
//       })
//     })
//   }

//   selectText(options: SelectTextOptions): Promise<SelectTextResponse> {
//     return new Promise((resolve, reject) => {
//       if (!vscode.window.activeTextEditor) {
//         return reject('no active text editor')
//       }
//       const start = vscode.window.activeTextEditor.document.positionAt(options.from)
//       const end = vscode.window.activeTextEditor.document.positionAt(options.to || options.from)
//       vscode.window.activeTextEditor.selection = new vscode.Selection(start, end);
//       resolve()
//     })
//   }
// }


