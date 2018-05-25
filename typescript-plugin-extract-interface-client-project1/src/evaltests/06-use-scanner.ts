
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;

function toEval() {
  const ts = c.ts, getKindName = c.util.getKindName, print = c.print;
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true);
  function initializeState(text) {
    scanner.setText(text);
    scanner.setOnError((message, length) => {
      print('Error: ' + message);
    });
    scanner.setScriptTarget(ts.ScriptTarget.ES5);
    scanner.setLanguageVariant(ts.LanguageVariant.Standard);
  }
  initializeState('var foo = 123;'.trim());
  var token = scanner.scan();
  while (token != ts.SyntaxKind.EndOfFileToken) {
    print(getKindName(token) + ', token: ' + token);    
    token = scanner.scan();
  }
}