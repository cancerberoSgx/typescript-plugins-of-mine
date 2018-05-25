class Computer {
  turnOn():Promise<void>{
    return Promise.resolve()
  }  
}
const comp = new Computer()
// comp.

function f(a, b, c, foo) {
  if (a < b)
    return a > 3 * foo.bar.alf && b < c
}
// PLEASE DONT TOUCH ANYTHING FROM BEGGINING UNTIL THIS COMMENT !! HARDCODED INDEXES!!!!


// simple demo - we will just verify that c.info.languageService.getCompletionsAtPosition 
// brings  the method completion for the class method 'turnOn'

import { EvalContext } from 'typescript-plugin-ast-inspector'
declare const c: EvalContext

function completionsTest1(){
  const print = c.print, printNode = c.util.printNode, ts = c.ts, assert = require('assert')

  const program = c.info.languageService.getProgram()
  const sourceFile = program.getSourceFile(c.fileName)

  // hardcoded number 113 is just at "comp.t" obtained evaluating comment below for 
  // this example - this will be priden by plugin impl
  // let position = 113 // c.util.positionOrRangeToNumber(c.positionOrRange) 
  // let child = c.util.findChildContainingPosition(sourceFile, position)
  // print(printNode(child))
  // assert.ok(ts.isIdentifier(child))
  // assert.ok(ts.isPropertyAccessExpression(child.parent))
  // let completions = c.info.languageService.getCompletionsAtPosition(sourceFile.fileName, position, {includeInsertTextCompletions: true, includeExternalModuleExports: true})
  // print(completions.entries.map(e=>e.name))
  // assert.ok(completions.entries.find(e=>e.name==='turnOn'))

  print(positino)
  const position2 = 198 

  const child2 = c.util.findChildContainingPosition(sourceFile, position2)
  print(printNode(child2))
}
/***@ 

// use this code to get the user's selection position to hardcode in the code above, just 
// select part of "let" nad activate refactor "eval code in comments"

const program = c.info.languageService.getProgram() 
const position = c.util.positionOrRangeToNumber(c.positionOrRange) 

c.print(position)

@***/