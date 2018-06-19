import {InputProviderImpl, InputSupport, InputTextResponse, InputTextOptions} from 'input-ui-ipc-provider'
import * as vscode from 'vscode';

export class VsCodeInputProvider extends InputProviderImpl {
  private supports: InputSupport = { 
    inputText: true,
    askSupported: true
   }
  inputText(options: InputTextOptions): Promise<InputTextResponse>{
    return new Promise(resolve=>{
      vscode.window.showInputBox(options).then(answer=>resolve({answer}))
    })
  }
  askSupported(): Promise<InputSupport>{
    return Promise.resolve(this.supports)
  }
}


