
export interface InputTextResponse{
  answer: string|undefined
}

export interface InputTextOptions {
  prompt?: string, 
  placeHolder?: string
}

export enum ACTION_NAME{
  askSupported= 'askSupported',
  inputText= 'inputText'
}

export type InputSupport = {
  [feature in ACTION_NAME]: boolean
}