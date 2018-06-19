import { InputSupport, InputTextOptions, InputTextResponse, INPUT_ACTIONS } from './types';
import axon = require('axon')

export function createConsumer(config: InputConsumerConfig): InputConsumer {
  return new InputConsumerImpl(config)
}

export interface InputConsumerConfig {
  log?: (msg: string) => void
  port: number
}

export interface InputConsumer {
  /** emits action `askSupported` so provider can tell which kind of input request it support  */
  askSupported(): Promise<InputSupport>

  hasSupport(feature: INPUT_ACTIONS): boolean

  /** emits action `inputText` so provider execute its implementation (showing an input box). Returns a promise that it will be resolved with the user's input or undefined if user cancelled the operation. */
  inputText(options: InputTextOptions): Promise<InputTextResponse>
}

class InputConsumerImpl implements InputConsumer {

  private supports: InputSupport = {
    inputText: false,
    askSupported: false
  }

  private sock: any

  constructor(private config: InputConsumerConfig) {
    this.config.log = this.config.log || console.log
    this.sock = axon.socket('req')

    this.sock.on('error', (e) => {
      this.config.log(`consumer error ${e}`)
    })
    this.sock.on('ignored error', (e) => {
      this.config.log(`consumer ignored error ${e}`)
    })
    this.sock.on('socket error', (e) => {
      this.config.log(`consumer socket error ${e}`)
    })
    this.sock.on('*', (e) => {
      this.config.log(`consumer * event * ${e}`)
    })

    this.sock.bind(this.config.port, '127.0.0.1')
  }

  askSupported(): Promise<InputSupport> {
    return new Promise(resolve => {
      this.config.log(`consumer requesting ${INPUT_ACTIONS.askSupported}`)
      this.sock.send(INPUT_ACTIONS.askSupported, {}, (res: InputSupport) => {
        this.config.log(`consumer got ${INPUT_ACTIONS.askSupported} response ${JSON.stringify(res)}`)
        this.supports = Object.assign({}, this.supports, res)
        resolve(this.supports)
      })
    })
  }

  inputText(options: InputTextOptions): Promise<InputTextResponse> {
    this.config.log(`consumer requesting ${INPUT_ACTIONS.inputText}`)
    return new Promise(resolve => {
      if (this.supports.inputText) {
        this.sock.send(INPUT_ACTIONS.inputText, options, (res: InputTextResponse) => {
          this.config.log(`consumer got ${INPUT_ACTIONS.inputText} response ${JSON.stringify(res)}`)
          resolve(res)
        })
      }
      else {
        resolve({ answer: undefined })
      }
    })
  }

  hasSupport(feature: INPUT_ACTIONS): boolean {
    return this.supports[feature]
  }
}