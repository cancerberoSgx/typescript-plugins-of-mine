function f(a: number, b: string[]): boolean {
  return true
}
import { EvalContext } from 'typescript-plugin-ast-inspector';
declare const c: EvalContext;
function evaluateMe() {
  const arg = c, print = c.print, ts = c.ts, TypeGuards = c.tsa.TypeGuards
  const sourceFile = c.project.createSourceFile('tmp/tmp_sourcefile_' + new Date().getTime() + '.ts', c.node.getSourceFile().getFullText())
  const a = 21, b = 34
  const fragment = sourceFile.getFullText().substring(a, b)
  // return print(fragment)
  sourceFile.insertText(21, '/*')
  sourceFile.insertText(b + 2, '*/')
  print(sourceFile.getText().substring(0, Math.min(sourceFile.getText().length, 500)))
  sourceFile.deleteImmediatelySync()
}
