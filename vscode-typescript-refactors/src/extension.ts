import * as vscode from 'vscode';
import { VsCodeInputProvider } from './inputProvider';


export function activate(context: vscode.ExtensionContext) {
  const provider = new VsCodeInputProvider({port: 3001, log: console.log})
  console.log('activated ', provider);
  
}

export function deactivate() {
}