import {InputProviderImpl, InputSupport, InputTextResponse, InputTextOptions, MessageBoxOptions, MessageBoxResponse} from 'input-ui-ipc-provider'
import * as vscode from 'vscode';

export class VsCodeInputProvider extends InputProviderImpl {
  private supports: InputSupport = { 
    inputText: true,
    askSupported: true, 
    messageBox :true
   }
  inputText(options: InputTextOptions): Promise<InputTextResponse>{
    return new Promise(resolve=>{
      vscode.window.showInputBox(options).then(answer=>resolve({answer}))
    })
  }
  messageBox(options: MessageBoxOptions): Promise<MessageBoxResponse>{
    vscode.window.showInformationMessage('hello')
    return new Promise(resolve=>{
      // if(options.type==='information'){
        vscode.window.showInformationMessage('hello')
      // }
      vscode.window.showInformationMessage(options.message, {modal: true}, 'OK').then(selection=>{
        // resolve({answer: !!  selection})
      })
      
      // (options).then(answer=>resolve({answer}))
      resolve({answer: true})
    })
  }
  askSupported(): Promise<InputSupport>{
    return Promise.resolve(this.supports)
  }
}


