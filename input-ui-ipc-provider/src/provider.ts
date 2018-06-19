import { ACTION_NAME, InputSupport, InputTextOptions, InputTextResponse } from './types';

const axon = require('axon');


export interface InputProviderConfig {
  log?: (msg) => void
  port: number
}
export interface InputProvider {
  inputText(options: InputTextOptions): Promise<InputTextResponse>
  askSupported(): Promise<InputSupport>
}

export abstract class InputProviderImpl implements InputProvider {
  private sock: any;
  constructor(private config: InputProviderConfig) {
    this.config.log = this.config.log || console.log
    this.sock = axon.socket('req')
    this.sock.connect(this.config.port)
    this.sock.on('message', function (action: string, options: any, reply: (response: any) => void) {
      if (action == ACTION_NAME.askSupported) {
        this.askSupported().then(reply)
      }
      else if (action === ACTION_NAME.inputText) {
        options = options || {}
        options.prompt = options.prompt || 'Enter value'
        options.placeHolder = options.placeHolder || 'ValueExample'
        this.inputText(options).then(reply)
      }
    })
  }

  abstract inputText(options: InputTextOptions): Promise<InputTextResponse>
  
  abstract askSupported(): Promise<InputSupport>

}

/*
class VsCodeInputProvider extends InputProviderImpl {
  private supports: InputSupport = { 
    inputText: true,
    askSupported: true
  }
  async inputText(options: InputTextOptions): Promise<InputTextResponse>{
    const answer = await vscode.window.showInputBox(options)
    return {answer}
  }
  askSupported(): Promise<InputSupport>{
    return Promise.resolve(this.supports)
  }
}
*/