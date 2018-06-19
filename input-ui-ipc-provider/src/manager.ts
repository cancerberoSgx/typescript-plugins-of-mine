import { InputSupport, InputProviderManagerConfig, InputTextResponse, InputTextOptions, InputProviderManager, ACTION_NAME } from './types';

const axon = require('axon');
class InputProviderManagerImpl implements InputProviderManager {
  private supports: InputSupport = { 
    inputText: false 
  }
  private sock: any;
  constructor (private config: InputProviderManagerConfig) {
    this.config.log = this.config.log || console.log
    this.sock = axon.socket('req');
    this.sock.bind(this.config.port);
    this.askSupported()
  }
  askSupported(){
    this.sock.send(ACTION_NAME.askSupported, {}, (res: InputSupport) => {
      this.supports = res
    });
  }
  inputText(options: InputTextOptions): Promise<InputTextResponse> {
    return new Promise(resolve=>{
      if (this.supports.inputText) {
        this.sock.send(ACTION_NAME.inputText ,options, (res: InputTextResponse) => {
          resolve(res)
        });
      }
      resolve({answer: undefined})
    })
  }
}
export function create(config: InputProviderManagerConfig){
  return new InputProviderManagerImpl(config)
}