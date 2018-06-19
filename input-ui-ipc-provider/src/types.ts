
export interface InputTextResponse {
  answer: string | undefined
}

/**
 * input text with advanced options - lelave all optional so poor technologies or implementations can still have possibility to implement and not support them.
 */
export interface InputTextOptions {
  prompt?: string,
  /**The value to prefill in the input box */
  value?: string
  /**
   * Set to `true` to keep the input box open when focus moves to another part of the editor or to another window.
   */
  ignoreFocusOut?: boolean;
  /**
   * Set to `true` to show a password prompt that will not show the typed value.
   */
  password?: boolean;
  /**An optional string to show as place holder in the input box to guide the user what to type. */
  placeHolder?: string,
  /**
 * An optional function that will be called to validate input and to give a hint to the user.  
 * Heads up - can be a string because I need to serialize for IPC
 * @param value The current value of the input box.
 * @return A human readable string which is presented as diagnostic message.
 * Return `undefined` if there is no error
 */
  validateInput? : ((value: string)=>Promise<string | undefined>)| string
}

export enum INPUT_ACTIONS {
  askSupported = 'askSupported',
  inputText = 'inputText',
  messageBox = 'messageBox',
  selectText = 'selectText'
}

export type InputSupport = {
  [feature in INPUT_ACTIONS]: boolean
}

export enum MessageBoxType {
  information = 'information',
  warning = 'warning',
  error = 'error'
}
export interface MessageBoxOptions {
  message: string
  type?: MessageBoxType
  /** if true the promise won't be resolved until user somehow closes the modal or dialog. If false is just a message user can ignore and so promise is resolved immediately */
  modal?: boolean
}

export interface AbstractInputResponse {
  error?: string
}
export interface MessageBoxResponse extends AbstractInputResponse {
  /** false if user cancelled the dialog, true if user accepted the button  */
  answer: boolean
}

/**
 * select the text or move the cursor to a position in the source document. For later just leave `to` undefined
 */
export interface SelectTextOptions extends AbstractInputResponse {
  from: number
  to?: number
}

export interface SelectTextResponse extends AbstractInputResponse {

}