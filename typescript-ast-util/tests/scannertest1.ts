import * as ts from 'typescript'
import {getKindName} from '../src'
const print = console.log

const scanner = ts.createScanner(ts.ScriptTarget.Latest,  true);
function initializeState(text: string) {
  scanner.setText(text);
  scanner.setOnError((message: ts.DiagnosticMessage, length: number) => {
    print('Error: '+message);
  });
  scanner.setScriptTarget(ts.ScriptTarget.ES5);
  scanner.setLanguageVariant(ts.LanguageVariant.Standard);
}
initializeState('var foo = 123;'.trim());
var token = scanner.scan();
while (token != ts.SyntaxKind.EndOfFileToken) {
  print( getKindName(token));
  token = scanner.scan();
}