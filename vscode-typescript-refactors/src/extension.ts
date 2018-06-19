import * as vscode from 'vscode';
import { VsCodeInputProvider } from 'input-ui-ipc-provider-vscode'

// let provider: VsCodeInputProvider
export function activate(context: vscode.ExtensionContext) {
  new VsCodeInputProvider({port: 3001, log: console.log})  
}

// export function getInputProvider(): VsCodeInputProvider|undefined{
//   return provider
// }

export function deactivate() {
}