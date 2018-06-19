
export interface InputTextResponse{
  answer: string|undefined
}

export interface InputTextOptions {
  prompt?: string, 
  placeHolder?: string
}

export enum INPUT_ACTIONS{
  askSupported= 'askSupported',
  inputText= 'inputText',
  messageBox= 'messageBox'
}

export type InputSupport = {
  [feature in INPUT_ACTIONS]: boolean
}

export interface MessageBoxOptions {
  message: string
  type?: 'information'|'warning'|'error'
  // /** if true the promise won't be resolved until user somehow closes the modal or dialog */
  // waitForConfirmation: boolean
}

export interface MessageBoxResponse{
  /** false if user cancelled the dialog, true if user accepted the button  */
  answer: boolean
}
