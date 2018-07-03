import * as ts from 'typescript';

export interface Position {
  readonly line: number;
  readonly character: number;
}

export interface TextChange {
  readonly start: number
  readonly end:number
  readonly newText: string;
}

export function updateSourceFile(sourceFile: ts.SourceFile, textChange: TextChange): ts.SourceFile {
  const currentSource = sourceFile.getFullText();
  const updateStartPosition = textChange.start
  const updateEndPosition = textChange.end
  const oldSourceBeforeChange = currentSource.slice(0, updateStartPosition);
  const oldSourceAfterChange = currentSource.slice(updateEndPosition);
  const newSource = oldSourceBeforeChange + textChange.newText + oldSourceAfterChange;
  const textChangeRange: ts.TextChangeRange = {
    span: {
      start: updateStartPosition,
      length: updateEndPosition - updateStartPosition
    },
    newLength: textChange.newText.length
  };
  return sourceFile.update(newSource, textChangeRange);
}



// source file manipulation

/**
 * @param sourceFile 
 * @param positionWhereToAdd (spanStart)
 * @param textToAdd 
 * @return the sourceFile with the modifications
 */
export function addTextToSourceFile(sourceFile: ts.SourceFile, positionWhereToAdd: number, textToAdd: string/* , charCountToDeleteFromPos: number = 0 */): ts.SourceFile {

  return updateSourceFile(sourceFile, {start: positionWhereToAdd, end: positionWhereToAdd, newText: textToAdd})
  // const spanLength = 0//charCountToDeleteFromPos // not removing 
  // const oldTextLength = sourceFile.text.length
  // const newText = sourceFile.text.substring(0, positionWhereToAdd) + textToAdd + sourceFile.text.substring(positionWhereToAdd, sourceFile.text.length)
  // // forcing the newLength so ts asserts wont fail:
  // // ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length)
  // const newLength = spanLength + newText.length - sourceFile.text.length
  // return ts.updateSourceFile(sourceFile, newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength }, true)
  // // return sourceFile.update(newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength })
}


