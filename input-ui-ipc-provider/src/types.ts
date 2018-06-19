
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
  messageBox= 'messageBox',
  selectText='selectText'
}

export type InputSupport = {
  [feature in INPUT_ACTIONS]: boolean
}

export interface MessageBoxOptions {
  message: string
  type?: 'information'|'warning'|'error'
  /** if true the promise won't be resolved until user somehow closes the modal or dialog. If false is just a message user can ignore and so promise is resolved immediately */
  modal?: boolean
}

export interface AbstractInputResponse{
  error?: string
}
export interface MessageBoxResponse extends AbstractInputResponse{
  /** false if user cancelled the dialog, true if user accepted the button  */
  answer: boolean
}

/**
 * select the text or move the cursor to a position in the source document. For later just leave `to` undefined
 */
export interface SelectTextOptions extends AbstractInputResponse{
  from: number
  to?: number
}

export interface SelectTextResponse extends AbstractInputResponse{

}