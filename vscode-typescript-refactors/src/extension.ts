import * as vscode from 'vscode';
import { VsCodeInputProvider } from './inputProvider';

let provider: VsCodeInputProvider
export function activate(context: vscode.ExtensionContext) {
  provider = new VsCodeInputProvider({port: 3001, log: console.log})  
}

export function getInputProvider(): VsCodeInputProvider|undefined{
  return provider
}

export function deactivate() {
}