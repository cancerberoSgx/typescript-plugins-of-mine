import { INPUT_ACTIONS, InputSupport, InputTextOptions, InputTextResponse } from './types';

const axon = require('axon');


export interface InputProviderConfig {
  log?: (msg: string) => void
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
    this.sock = axon.socket('rep')
    this.sock.on('error', (e)=>{
      this.config.log(`provider socket error ${e}`)
    })
    this.sock.on('ignored error', (e)=>{
      this.config.log(`provider socket ignored error ${e}`)
    })
    
    this.sock.on('socket error', (e)=>{
      this.config.log(`provider socket socket error ${e}`)
    })
    this.sock.on('*', (e)=>{
      this.config.log(`provider socket event * ${e}`)
    })
    // this.sock.bind(this.config.port)
    this.sock.connect(this.config.port)
    // this.config.log('input provider constructor '+this.config.port)
    this.sock.on('message', (action: string, options: any, reply: (response: any) => void) =>{
      // this.config.log('input provider message2 '+action)
      this.config.log('input provider message '+action+' - options: '+JSON.stringify(options))
      if (action === INPUT_ACTIONS.askSupported) {
        this.askSupported().then(reply)
      }
      else if (action === INPUT_ACTIONS.inputText) {
        options = options || {}
        options.prompt = options.prompt || 'Enter value'
        options.placeHolder = options.placeHolder || 'ValueExample'
        this.inputText(options).then(reply)
      }
    })
    // this.config.log('input provider connect '+this.config.port)
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