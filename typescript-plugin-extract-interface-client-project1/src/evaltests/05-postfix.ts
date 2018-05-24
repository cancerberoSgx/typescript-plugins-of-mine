// want to implement something similar to  https://github.com/ipatalas/vscode-postfix-ts for if()

a>3&&b<c.if

import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

const program = c.info.languageService.getProgram()
const sourceFile = program.getSourceFile(c.fileName)
const position = c.util.positionOrRangeToNumber(c.positionOrRange)
const node = c.util.findChildContainingPosition(sourceFile, position)
c.print(c.util.getKindName(node.kind)+' - '+node.getFullStart()+' - '+node.getFullWidth())
// const containedDiagnostic = 




/***@ 


@***/
