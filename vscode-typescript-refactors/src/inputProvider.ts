import { InputProviderImpl, InputSupport, InputTextResponse, InputTextOptions, MessageBoxOptions, MessageBoxResponse } from 'input-ui-ipc-provider'
import * as vscode from 'vscode';

export class VsCodeInputProvider extends InputProviderImpl {
  private supports: InputSupport = {
    inputText: true,
    askSupported: true,
    messageBox: true
  }
  inputText(options: InputTextOptions): Promise<InputTextResponse> {
    return new Promise(resolve => {
      vscode.window.showInputBox(options).then(answer => resolve({ answer }))
    })
  }
  messageBox(options: MessageBoxOptions): Promise<MessageBoxResponse> {
    return new Promise(resolve => {
      const opts = { modal: options.modal }
      let promise: Thenable<string | undefined> | undefined
      if (options.type === 'error') {
        promise = vscode.window.showErrorMessage(options.message, opts)
      }
      else if (options.type === 'warning') {
        promise = vscode.window.showWarningMessage(options.message, opts)
      } 
      else{
        promise = vscode.window.showInformationMessage(options.message, opts)
      }
      // if (promise !== undefined) {
        promise.then(result => {
          resolve({ answer: !!result })
        })
      // }
    })
  }
  
  askSupported(): Promise<InputSupport> {
    return Promise.resolve(this.supports)
  }
}


