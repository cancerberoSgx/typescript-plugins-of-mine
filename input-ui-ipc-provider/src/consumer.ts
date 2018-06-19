import { InputSupport, InputTextResponse, InputTextOptions, ACTION_NAME } from './types'
import axon = require('axon')

export function createConsumer(config: InputConsumerConfig){
  return new inputConsumerImpl(config)
}

export interface InputConsumerConfig {
  log?: (msg) => void
  port: number
}

export interface InputConsumer {
  /** emits action `askSupported` so provider can tell which kind of input request it support  */
  askSupported(): Promise<InputSupport>
  
  hasSupport(feature: ACTION_NAME): boolean

  /** emits action `inputText` so provider execute its implementation (showing an input box). Returns a promise that it will be resolved with the user's input or undefined if user cancelled the operation. */
  inputText(options: InputTextOptions): Promise<InputTextResponse>
}

class inputConsumerImpl implements InputConsumer {
  private supports: InputSupport = { 
    inputText: false, 
    askSupported: false
  }
  private sock: any
  constructor (private config: InputConsumerConfig) {
    this.config.log = this.config.log || console.log
    this.sock = axon.socket('req')
    this.sock.bind(this.config.port)
  }
  askSupported(): Promise<InputSupport> {
    return new Promise(resolve=>{
      this.sock.send(ACTION_NAME.askSupported, {}, (res: InputSupport) => {
        this.supports = Object.assign({}, this.supports, res)
        resolve(this.supports)
      })
    })    
  }
  inputText(options: InputTextOptions): Promise<InputTextResponse> {
    return new Promise(resolve=>{
      if (this.supports.inputText) {
        this.sock.send(ACTION_NAME.inputText ,options, (res: InputTextResponse) => {
          resolve(res)
        })
      }
      resolve({answer: undefined})
    })
  }
  hasSupport(feature: ACTION_NAME): boolean{
    return this.supports[feature]
  }
}