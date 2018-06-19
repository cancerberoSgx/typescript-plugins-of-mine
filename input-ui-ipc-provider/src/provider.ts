import { InputSupport, InputTextOptions, InputTextResponse, INPUT_ACTIONS } from './types';
const axon = require('axon');

export interface InputProviderConfig {
  log?: (msg: string) => void
  port: number
}

export interface InputProvider {
  /** implementors ask the user to enter a string (like in an input text box) */
  inputText(options: InputTextOptions): Promise<InputTextResponse>
  /** implementors return which features are supported by this input provider */
  askSupported(): Promise<InputSupport>
  setLogger(log: (msg: string) => void): void
}

/**
 * this class is meant to be extended. Implementors only need to focus on declare which features are supported and to implement the visual metaphors like `inputText`
 */
export abstract class InputProviderImpl implements InputProvider {

  private sock: any;

  constructor(private config: InputProviderConfig) {
    this.config.log = this.config.log || console.log
    this.sock = axon.socket('rep')
    this.sock.on('error', (e) => {
      this.config.log(`provider socket error ${e}`)
    })
    this.sock.on('ignored error', (e) => {
      this.config.log(`provider socket ignored error ${e}`)
    })
    this.sock.on('socket error', (e) => {
      this.config.log(`provider socket socket error ${e}`)
    })
    this.sock.on('*', (e) => {
      this.config.log(`provider socket event * ${e}`)
    })
    this.sock.connect(this.config.port, '127.0.0.1')
    this.sock.on('message', (action: string, options: any, reply: (response: any) => void) => {
      this.config.log('input provider message ' + action + ' - options: ' + JSON.stringify(options))
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
    this.config.log('input provider connect ' + this.config.port)
  }

  abstract inputText(options: InputTextOptions): Promise<InputTextResponse>

  abstract askSupported(): Promise<InputSupport>

  setLogger(log: (msg: string) => void):void{
    this.config.log = log
  }
}
