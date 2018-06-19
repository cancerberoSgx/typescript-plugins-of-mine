
export interface InputTextResponse{
  answer: string|undefined
}

export interface InputTextOptions {
  prompt?: string, 
  placeHolder?: string
}

export enum INPUT_ACTIONS{
  askSupported= 'askSupported',
  inputText= 'inputText'
}

export type InputSupport = {
  [feature in INPUT_ACTIONS]: boolean
}