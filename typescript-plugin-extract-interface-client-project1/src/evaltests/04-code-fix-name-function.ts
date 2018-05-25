// now let's try to implement a plugin that adds a "name" function declarations without name. This is an error
// in typescript and the plugin will suggest fixing it by just putting a dummy name. The
// following snippet shows that :

// function(a: number):[number]{ return [Math.PI*a/2]}


import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

// the following is the snippets to be evaluated. Again, make sure is valid JavaScript!

// First thing in a plugin is decide if a predicate should be suggested to the user for a given cursor
// position in the source file: 
const program = c.info.languageService.getProgram()
const sourceFile = program.getSourceFile(c.fileName)
const position = c.util.positionOrRangeToNumber(c.positionOrRange)

// first a test to obtain the compilation errors and see their structure: 
const diagnostics = program.getSyntacticDiagnostics()
c.print(JSON.stringify(diagnostics.map(d=>({code: d.code, start: d.start, length: d.length,messageText: d.messageText})) ))
// lets find the diagnostic contained by the user's selection
diagnostics.find

const node = c.util.findChildContainingPosition(sourceFile, position)
c.print(node.getFullStart()+' - '+node.getFullWidth())




/***@ 

// use this code to get the user's selection position to hardcode in the code above, just select part 
// of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram()
const position = c.util.positionOrRangeToNumber(c.positionOrRange)
c.print(position)

@***/
