import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  var axon = require('axon');
  var sock = axon.socket('rep');
  sock.connect(3000);
  
  sock.on('message', function (action: string, options: any, reply: (response:any)=>void) {
    if(action=='askSupported'){
      reply({inputText: true})  
    }
    else if(action==='inputText'){
      options = options || {}
      options.prompt = options.prompt || 'Enter value'
      options.placeHolder = options.placeHolder || 'ValueExample'
      vscode.window.showInputBox(options)
        .then(answer=>reply({answer}))
    }
  }); 
  // console.log('extension activated finish');
}

export function deactivate() {
}