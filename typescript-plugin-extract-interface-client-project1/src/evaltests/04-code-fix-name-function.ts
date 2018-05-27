// now let's try to implement a plugin that adds a "name" function declarations without name. This is an error
// in typescript and the plugin will suggest fixing it by just putting a dummy name. The
// following snippet shows that :

function(a: number): [number] { return [Math.PI * a / 2] }

import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

function fixUnnamedFunction() {
  const print = c.print, findAscendant = c.util.findAscendant, getKindName = c.util.getKindName, positionOrRangeToNumber = c.util.positionOrRangeToNumber, findChildContainingPosition = c.util.findChildContainingPosition, ts = c.ts
  const program = c.info.languageService.getProgram()
  const sourceFile = program.getSourceFile(c.fileName)
  // first a test to obtain the compilation errors and see their structure: 
  const diagnostics = program.getSyntacticDiagnostics()
  // c.print(JSON.stringify(diagnostics.map(d => ({ code: d.code, start: d.start, length: d.length, messageText: d.messageText }))))
  // lets find the diagnostic contained by the user's selection
  // diagnostics.find

  c.positionOrRange = 243
  const position = positionOrRangeToNumber(c.positionOrRange)
  const node = findChildContainingPosition(sourceFile, position)
  const funcDecl = ts.isFunctionDeclaration(node) ? node : findAscendant(node, ts.isFunctionDeclaration)

  if (!ts.isFunctionDeclaration(funcDecl)) {
    return print('Function Declaration not found in selected position')
  }

  const transformFactory = (context) => rootNode => {
    const visit = (node) => {
      node = ts.visitEachChild(node, visit, context)
      if (ts.isFunctionDeclaration(node) && (!node.name || !node.name.escapedText)) {
        const clone = ts.getMutableClone(node)
        clone.name = ts.createIdentifier('unnamedFunc')
        return clone
      }
      return node
    }
    return ts.visitNode(rootNode, visit)
  }

  const tranformationResult = ts.transform(sourceFile, [transformFactory], program.getCompilerOptions())
  const result =  ts.createPrinter().printNode(ts.EmitHint.Unspecified, tranformationResult.transformed[0], sourceFile);
  const transformedFile =  ts.createSourceFile("transformedFile.ts", result, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const func = c.util.findChild(transformedFile, c=>ts.isFunctionDeclaration(c)&&c.name&&c.name.escapedText==='unnamedFunc')
  print(func.getText())
}


/***@ 

// use this code to get the user's selection position to hardcode in the code above, just select part 
// of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram()
const position = c.util.positionOrRangeToNumber(c.positionOrRange)
c.print(position)

@***/
