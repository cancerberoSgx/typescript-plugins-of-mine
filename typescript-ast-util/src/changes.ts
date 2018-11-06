import {SourceFile, TextChange} from 'typescript'

// taken from ts-simple-ast
export function getTextFromFormattingEdits(sourceFile: SourceFile|string, formattingEdits: ReadonlyArray<TextChange>) {
  // reverse the order
  formattingEdits = [...formattingEdits].sort((a, b) => b.span.start - a.span.start);
  let text = typeof(sourceFile)==='string' ? sourceFile : sourceFile.getFullText();

  for (const textChange of formattingEdits) {
      const span = textChange.span
      text = text.slice(0, span.start) + textChange.newText + text.slice(span.start+span.length);
  }

  return text;
}
