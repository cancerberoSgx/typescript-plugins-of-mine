
export interface InputTextOptions {
  prompt?: string, 
  placeHolder?: string
}

export interface InputSupport { 
  inputText: boolean; 
}

export interface InputProviderManagerConfig {
  log?: (msg) => void
  port: number
}

export enum ACTION_NAME{
  askSupported= 'askSupported',
  inputText= 'inputText'
}
export interface InputProviderManager{
  askSupported()
  inputText(options: InputTextOptions): Promise<InputTextResponse>
}

export interface InputTextResponse{
  answer: string|undefined
}