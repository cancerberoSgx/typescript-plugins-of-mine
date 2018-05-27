
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello: Hello = {}
let i: string[]
i = hello.world//([[1,2,3], [4,5]])
const k = hello.mama() + ' how are you?'
function(h: Hello) {
  h.fromFunc = true
}

import { EvalContext } from 'typescript-plugin-ast-inspector';
import { access } from 'fs';
declare const c: EvalContext;

function evaluateMe() {
  const Project = c.tsa.Project, print = c.print, ts = c.ts, tsa = c.tsa, TypeGuards = c.tsa.TypeGuards, getKindName = c.util.getKindName, findAscendant = c.util.findAscendant
  const position = 345
  const project = new c.SimpleProjectConstructor();
  const sourceFile = project.createSourceFile('created.ts', `
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'
function(h:Hello){
  h.fromFunc=true
}

`)
  const node = sourceFile.getDescendantAtPos(position)
  // print('node.getAncestors()===' + node.getAncestors().map(a => a.getKindName() + `(${a.getText()})`).join(', '))
  const typeChecker = project.getTypeChecker()
  const newMemberName_ = node.getText()
  const accessExpr = node.getParent()
  if (!TypeGuards.isPropertyAccessExpression(accessExpr)) {
    return print(`WARNING !TypeGuards.isPropertyAccessExpression(accessExpr) ${accessExpr.getKindName()}`)// TODO: log
  }
  const expressionWithTheType = accessExpr.getParent().getKind() === ts.SyntaxKind.CallExpression ?
    accessExpr.getParent().getParent() : accessExpr.getParent()
  const newMemberType_ = typeChecker.getTypeAtLocation(expressionWithTheType).getBaseTypeOfLiteralType()

  // now we extract arguments in case is a method call, example: const k = hello.mama(1,2,3)+' how are you?'-.
  let args_
  const callExpression = accessExpr.getParent()
  if (TypeGuards.isCallExpression(callExpression)) {
    let argCounter = 0
    args_ = callExpression.getArguments().map(a => ({ name: `arg${argCounter++}`, type: typeChecker.getTypeAtLocation(a).getBaseTypeOfLiteralType() }))
  }
  // print(`newMemberType:${newMemberType.getText()}, newMemberName: ${newMemberName}, args: ${args && args.map(a=>a.name+': '+a.type.getText())} `)
  // now we need to get the target declaration and add the member. It could be an object literal decl{}, an interface decl or a class decl
  const fixTargetDecl = (targetNode, newMemberName, newMemberType, args) => {
    let decls
    if(targetNode.getExpression) {
      decls = targetNode.getExpression().getSymbol().getDeclarations()
    } else if(targetNode && targetNode.getKindName().endsWith('Declaration')){
      decls = [targetNode]
    }else {
      return print(`WARNING cannot recognize accessExpr : ${targetNode && targetNode.getKindName()} ${targetNode &&targetNode.getText()}`)
    }
    decls.forEach(d => {
      if (TypeGuards.isVariableDeclaration(d)) {
        const targetInit = d.getInitializer()
        if (!TypeGuards.isObjectLiteralExpression(targetInit)) {  //TODO LOG - what it is ?? we need to support it?
          return print(`WARNING  !TypeGuards.isObjectLiteralExpression(targetInit) ${targetInit.getKindName()} ${targetInit.getText()}`)
        }
        if (!args) {
          targetInit.addPropertyAssignment({ name: newMemberName, initializer: 'null' })
        }
        else {
          targetInit.addMethod({
            name: newMemberName,
            returnType: newMemberType.getText(),
            bodyText: `throw new Error('Not Implemented')`,
            parameters: args.map(a => ({ name: a.name, type: a.type.getText() }))
          })
        }
      } else if (TypeGuards.isInterfaceDeclaration(d)) {
        if (!args) {
          d.addProperty({ name: newMemberName, type: newMemberType.getText() })
        } else {
          d.addMethod(
            {
              name: newMemberName,
              returnType: newMemberType.getText(),
              parameters: args.map(a => ({
                name: a.name,
                type: a.type.getText()
              }))
            })
        }
      }

      else if (TypeGuards.isParameterDeclaration(d)) {
        // we are adding the new member from inside a function to a parameter declaration, 
        // like this: function(h:Hello){  h.fromFunc=true } - we need to look for the type decl
        d.getType().getSymbol().getDeclarations().map(dd => {
          fixTargetDecl(dd, newMemberName, newMemberType, args) // recursive!
        })
      }
      else {
        print(`WARNING: is another thing isParameterDeclaration ${d.getKind()}`)
      }
    })
  }

  fixTargetDecl(accessExpr, newMemberName_, newMemberType_, args_)


  print(sourceFile.getText())





}
var __output = `
Output:
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
    fromFunc: boolean;
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'
function(h:Hello){
  h.fromFunc=true
}



`
var __output = `
Output:
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
    fromFunc: true;
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'
function(h:Hello){
  h.fromFunc=true
}



`
var __output = `
Error: (in)
TypeError: writerFunc is not a function
Stack:
 TypeError: writerFunc is not a function
    at getTextForWriterFunc (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/structurePrinters/base/TypedNodeStructurePrinter.js:27:13)
    at TypedNodeStructurePrinter.printText (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/structurePrinters/base/TypedNodeStructurePrinter.js:22:65)
    at PropertySignatureStructurePrinter.printText (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/structurePrinters/interface/PropertySignatureStructurePrinter.js:21:40)
    at NewLineFormattingStructuresPrinter.printText (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/structurePrinters/formatting/NewLineFormattingStructuresPrinter.js:17:35)
    at PropertySignatureStructurePrinter.printTexts (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/structurePrinters/interface/PropertySignatureStructurePrinter.js:14:29)
    at Object.write (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/compiler/base/TypeElementMemberedNode.js:196:43)
    at getNewText (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/manipulation/manipulations/insertion.js:109:14)
    at insertIntoBracesOrSourceFile (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/manipulation/manipulations/insertion.js:99:19)
    at Object.insertIntoBracesOrSourceFileWithGetChildren (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/manipulation/manipulations/insertion.js:138:5)
    at insertChildren (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/compiler/base/TypeElementMemberedNode.js:188:27)
    at InterfaceDeclaration.TypeElementMemberedNode.class_1.insertProperties (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/compiler/base/TypeElementMemberedNode.js:146:20)
    at InterfaceDeclaration.TypeElementMemberedNode.class_1.addProperties (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/compiler/base/TypeElementMemberedNode.js:139:25)
    at InterfaceDeclaration.TypeElementMemberedNode.class_1.addProperty (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/compiler/base/TypeElementMemberedNode.js:136:25)
    at decls.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:73:13)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:54:11)
    at d.getType.getSymbol.getDeclarations.map.dd (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:91:11)
    at Array.map (native)
    at decls.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:90:51)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:54:11)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:100:3)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:110:3)
    at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9)
    at evalCodeAndPrintResult (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:130:20)
    at Object.executeEvalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:96:22)
    at evalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:76:20)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:53:16)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/dist/src/index.js:60:44)
    at IOSession.Session.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:91954:59)
    at Session.handlers.ts.createMapFromTemplate._a.(anonymous function) (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:90877:61)
    at /home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:88
    at IOSession.Session.executeWithRequestId (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92151:28)
    at IOSession.Session.executeCommand (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:33)
    at IOSession.Session.onMessage (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92180:35)
    at Interface.<anonymous> (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:93377:27)
    at emitOne (events.js:96:13)
    at Interface.emit (events.js:191:7)
    at Interface._onLine (readline.js:241:10)
    at Interface._normalWrite (readline.js:384:12)
    at Socket.ondata (readline.js:101:10)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:191:7)
    at readableAddChunk (_stream_readable.js:178:18)
    at Socket.Readable.push (_stream_readable.js:136:10)
    at Pipe.onread (net.js:560:20)
Output:


`
var __output = `
Error: (in)
TypeError: Cannot read property 'getKind' of undefined
Stack:
 TypeError: Cannot read property 'getKind' of undefined
    at Function.TypeGuards.isVariableDeclaration (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/node_modules/ts-simple-ast/dist/utils/TypeGuards.js:2264:20)
    at decls.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:55:22)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:54:11)
    at d.getType.getSymbol.getDeclarations.map.dd (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:91:11)
    at Array.map (native)
    at decls.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:90:51)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:54:11)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:100:3)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:110:3)
    at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9)
    at evalCodeAndPrintResult (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:130:20)
    at Object.executeEvalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:96:22)
    at evalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:76:20)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:53:16)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/dist/src/index.js:60:44)
    at IOSession.Session.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:91954:59)
    at Session.handlers.ts.createMapFromTemplate._a.(anonymous function) (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:90877:61)
    at /home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:88
    at IOSession.Session.executeWithRequestId (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92151:28)
    at IOSession.Session.executeCommand (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:33)
    at IOSession.Session.onMessage (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92180:35)
    at Interface.<anonymous> (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:93377:27)
    at emitOne (events.js:96:13)
    at Interface.emit (events.js:191:7)
    at Interface._onLine (readline.js:241:10)
    at Interface._normalWrite (readline.js:384:12)
    at Socket.ondata (readline.js:101:10)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:191:7)
    at readableAddChunk (_stream_readable.js:178:18)
    at Socket.Readable.push (_stream_readable.js:136:10)
    at Pipe.onread (net.js:560:20)
Output:


`
var __output = `
Output:
!accessExpr.getExpression false interface Hello {
}
const o = {
  foo: () => { return 1 }
}
const val: string[] = o.bar(1, ['w'], true) //	"code": "2339",	"message": "Property 'bar' does not exist on type '{ foo: () => number; }'."
interface Hello {
}
const hello:Hello = {}
let i:string[]
i=hello.world//([[1,2,3], [4,5]])
const k = hello.mama(1,2,3)+' how are you?'
function(h:Hello){
  h.fromFunc=true
}



`
var __output = `
Error: (in)
TypeError: accessExpr.getExpression is not a function
Stack:
 TypeError: accessExpr.getExpression is not a function
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:47:16)
    at d.getType.getSymbol.getDeclarations.map.dd (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:84:11)
    at Array.map (native)
    at accessExpr.getExpression.getSymbol.getDeclarations.forEach.d (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:83:51)
    at Array.forEach (native)
    at fixTargetDecl (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:47:62)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:93:3)
    at eval (eval at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9), <anonymous>:103:3)
    at doEval (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:59:9)
    at evalCodeAndPrintResult (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:130:20)
    at Object.executeEvalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/evalCode.js:96:22)
    at evalCode (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:76:20)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-ast-inspector/dist/index.js:53:16)
    at Object.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-proactive-code-fixes/dist/src/index.js:60:44)
    at IOSession.Session.getEditsForRefactor (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:91954:59)
    at Session.handlers.ts.createMapFromTemplate._a.(anonymous function) (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:90877:61)
    at /home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:88
    at IOSession.Session.executeWithRequestId (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92151:28)
    at IOSession.Session.executeCommand (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92160:33)
    at IOSession.Session.onMessage (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:92180:35)
    at Interface.<anonymous> (/home/sg/git/typescript-plugins-of-mine/typescript-plugin-extract-interface-client-project1/node_modules/typescript/lib/tsserver.js:93377:27)
    at emitOne (events.js:96:13)
    at Interface.emit (events.js:191:7)
    at Interface._onLine (readline.js:241:10)
    at Interface._normalWrite (readline.js:384:12)
    at Socket.ondata (readline.js:101:10)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:191:7)
    at readableAddChunk (_stream_readable.js:178:18)
    at Socket.Readable.push (_stream_readable.js:136:10)
    at Pipe.onread (net.js:560:20)
Output:


`



