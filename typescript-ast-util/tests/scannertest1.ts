import * as ts from 'typescript'

const scanner = ts.createScanner(ts.ScriptTarget.Latest,  true);
function initializeState(text: string) {
  scanner.setText(text);
  scanner.setOnError((message: ts.DiagnosticMessage, length: number) => {
    console.log('Error: '+message);
  });
  scanner.setScriptTarget(ts.ScriptTarget.ES5);
  scanner.setLanguageVariant(ts.LanguageVariant.Standard);
}
initializeState('var foo = 123;'.trim());
var token = scanner.scan();
while (token != ts.SyntaxKind.EndOfFileToken) {
  console.log( getKindName(token));
  token = scanner.scan();
}

export function getKindName(kind: ts.SyntaxKind) {
  return (<any>ts).SyntaxKind[kind];
} 