import * as vscode from 'vscode';
import { VsCodeInputProvider } from 'input-ui-ipc-provider-vscode';

export function activate(context: vscode.ExtensionContext) {
  new VsCodeInputProvider({port: 3001, log: console.log})  
}
export function deactivate() {
}